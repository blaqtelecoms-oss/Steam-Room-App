// Supabase-backed drop-in replacement for the former Base44 SDK client.
// Exposes the same surface the app already calls: base44.entities.<Entity>.{list,filter,get,
// create,update,delete,bulkCreate}, base44.auth.*, base44.functions.invoke, base44.integrations.
// Core.*, base44.users.inviteUser — backed by Supabase tables / Auth / Storage.
import { supabase } from "@/lib/supabaseClient";

/* eslint-disable no-console */

let currentUserId = null; // Base44-style profile id of the logged-in user (set by auth.me)

const genId = () =>
  (globalThis.crypto?.randomUUID?.()?.replace(/-/g, "").slice(0, 24)) ||
  Math.random().toString(16).slice(2, 26).padEnd(24, "0");

const nowISO = () => new Date().toISOString();

// Strip undefined values so Supabase doesn't reject the payload.
const clean = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
};

const enrich = (error) => {
  const e = new Error(error?.message || "Supabase request failed");
  e.status = error?.code ? Number(error.code) : undefined;
  e.cause = error;
  return e;
};

function applyOrder(q, orderBy) {
  if (!orderBy) return q;
  if (orderBy.startsWith("-")) return q.order(orderBy.slice(1), { ascending: false });
  return q.order(orderBy, { ascending: true });
}

const PG_OP = { $gte: "gte", $lte: "lte", $gt: "gt", $lt: "lt", $ne: "neq", $in: "in" };

// Translate Mongo-style operators on a single field into PostgREST chain calls.
function applyOps(q, key, value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [op, ov] of Object.entries(value)) {
      if (op === "$gte") q = q.gte(key, ov);
      else if (op === "$lte") q = q.lte(key, ov);
      else if (op === "$gt") q = q.gt(key, ov);
      else if (op === "$lt") q = q.lt(key, ov);
      else if (op === "$ne") q = q.neq(key, ov);
      else if (op === "$in") q = q.in(key, ov);
    }
    return q;
  }
  return q.eq(key, value);
}

function applyFilters(q, filters) {
  if (!filters || typeof filters !== "object") return q;
  for (const [key, val] of Object.entries(filters)) {
    if (key === "$or") {
      q = q.or(buildOr(val));
    } else if (key === "$and") {
      for (const sub of val) q = applyFilters(q, sub);
    } else {
      q = applyOps(q, key, val);
    }
  }
  return q;
}

// Build a PostgREST or() string: branches of conditions (each branch is AND'd inside `and(...)`).
function buildOr(branches) {
  return branches
    .map((b) => {
      const conds = [];
      for (const [k, v] of Object.entries(b)) {
        if (v && typeof v === "object" && !Array.isArray(v)) {
          for (const [op, ov] of Object.entries(v)) conds.push(`${k}.${PG_OP[op] || "eq"}.${fmt(ov)}`);
        } else {
          conds.push(`${k}.eq.${fmt(v)}`);
        }
      }
      return `and(${conds.join(",")})`;
    })
    .join(",");
}

const fmt = (v) => (v instanceof Date ? v.toISOString() : String(v));

function makeEntity(table) {
  return {
    async list(orderByOrOpts, limit) {
      let q = supabase.from(table).select("*");
      if (orderByOrOpts && typeof orderByOrOpts === "object" && !Array.isArray(orderByOrOpts)) {
        const opts = orderByOrOpts;
        if (opts.distinct) {
          const { data, error } = await q;
          if (error) throw enrich(error);
          const seen = new Set();
          const out = [];
          for (const r of data || []) {
            if (!seen.has(r[opts.distinct])) {
              seen.add(r[opts.distinct]);
              out.push(r);
            }
          }
          return out;
        }
        if (opts.order_by) q = applyOrder(q, opts.order_by);
        if (opts.limit) q = q.limit(opts.limit);
      } else if (typeof orderByOrOpts === "string") {
        q = applyOrder(q, orderByOrOpts);
        if (limit) q = q.limit(limit);
      } else if (typeof orderByOrOpts === "number") {
        q = q.limit(orderByOrOpts);
      }
      const { data, error } = await q;
      if (error) throw enrich(error);
      return data || [];
    },

    async filter(filters, orderByOrOpts, limit) {
      let q = supabase.from(table).select("*");
      q = applyFilters(q, filters || {});
      if (typeof orderByOrOpts === "string") {
        q = applyOrder(q, orderByOrOpts);
        if (limit) q = q.limit(limit);
      } else if (orderByOrOpts && typeof orderByOrOpts === "object") {
        if (orderByOrOpts.order_by) q = applyOrder(q, orderByOrOpts.order_by);
        if (orderByOrOpts.limit) q = q.limit(orderByOrOpts.limit);
        else if (limit) q = q.limit(limit);
      } else if (typeof orderByOrOpts === "number") {
        q = q.limit(orderByOrOpts);
      }
      const { data, error } = await q;
      if (error) throw enrich(error);
      return data || [];
    },

    async get(id) {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw enrich(error);
      return data;
    },

    async create(payload) {
      const row = clean(payload);
      if (!row.id) row.id = genId();
      row.created_date = row.created_date || nowISO();
      row.updated_date = row.updated_date || nowISO();
      if (currentUserId && !row.created_by_id) row.created_by_id = currentUserId;
      const { data, error } = await supabase.from(table).insert(row).select("*").single();
      if (error) throw enrich(error);
      return data;
    },

    async update(id, payload) {
      const row = clean(payload);
      row.updated_date = row.updated_date || nowISO();
      const { data, error } = await supabase.from(table).update(row).eq("id", id).select("*").single();
      if (error) throw enrich(error);
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw enrich(error);
      return { id };
    },

    async bulkCreate(arr) {
      const rows = (arr || []).map((r) => {
        const row = clean(r);
        if (!row.id) row.id = genId();
        row.created_date = row.created_date || nowISO();
        row.updated_date = row.updated_date || nowISO();
        if (currentUserId && !row.created_by_id) row.created_by_id = currentUserId;
        return row;
      });
      if (!rows.length) return [];
      const { data, error } = await supabase.from(table).insert(rows).select("*");
      if (error) throw enrich(error);
      return data || [];
    },
  };
}

// base44.entities.<AnyEntity> → table name.
// Most entities just lowercase, but a few table names are plural.
const TABLE_MAP = { order: "orders", user: "users" };

const entities = new Proxy(
  {},
  {
    get(_, name) {
      if (typeof name !== "string") return undefined;
      const key = name.toLowerCase();
      return makeEntity(TABLE_MAP[key] || key);
    },
  }
);

const auth = {
  async me() {
    const {
      data: { user: au },
    } = await supabase.auth.getUser();
    if (!au) {
      const e = new Error("Not authenticated");
      e.status = 401;
      throw e;
    }
    let profile = null;
    const byAuth = await supabase.from("users").select("*").eq("auth_id", au.id).maybeSingle();
    if (byAuth.error) throw enrich(byAuth.error);
    profile = byAuth.data;
    if (!profile && au.email) {
      const byEmail = await supabase.from("users").select("*").eq("email", au.email).maybeSingle();
      profile = byEmail.data;
    }
    if (profile) {
      currentUserId = profile.id;
      return profile;
    }
    currentUserId = au.id;
    return { id: au.id, email: au.email, role: au.user_metadata?.app_role || "user", auth_id: au.id };
  },
  async isAuthenticated() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  },
  redirectToLogin(returnTo) {
    const url = "/login" + (returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : "");
    window.location.href = url;
  },
  async logout(returnTo) {
    await supabase.auth.signOut();
    currentUserId = null;
    if (returnTo) window.location.href = "/login";
  },
};

// ---- Backend functions (formerly Base44 server functions) ----
// Implemented client-side where the logic is pure data aggregation / CRUD against Supabase.
// Functions that depend on external services (Yoco, email, AI) are flagged for an Edge Function.

const FN = {
  async GetMemberPortalData({ member_id }) {
    const [payments, bookings, progress, programs, trainers, agreements, mandates] =
      await Promise.all([
        supabase.from("payment").select("*").eq("member_id", member_id).order("date", { ascending: false }),
        supabase.from("booking").select("*").eq("member_id", member_id).order("date", { ascending: false }),
        supabase.from("progress").select("*").eq("member_id", member_id).order("date", { ascending: false }),
        supabase.from("program").select("*"),
        supabase.from("trainer").select("*").order("order"),
        supabase.from("agreement").select("*").eq("member_id", member_id).order("signed_date", { ascending: false }),
        supabase.from("mandate").select("*").eq("member_id", member_id).order("created_date", { ascending: false }),
      ]);
    for (const r of [payments, bookings, progress, programs, trainers, agreements, mandates]) {
      if (r.error) throw enrich(r.error);
    }
    return {
      payments: payments.data || [],
      bookings: bookings.data || [],
      progress: progress.data || [],
      programs: programs.data || [],
      trainers: trainers.data || [],
      agreements: agreements.data || [],
      mandates: mandates.data || [],
    };
  },

  async GetTrainerBookings({ trainer_id }) {
    let q = supabase.from("booking").select("*");
    if (trainer_id && trainer_id !== "admin") q = q.eq("trainer_id", trainer_id);
    q = q.order("date", { ascending: false });
    const { data, error } = await q;
    if (error) throw enrich(error);
    return { bookings: data || [] };
  },

  async MarkBookingTrainerPaid({ booking_id, booking_ids }) {
    const ids = booking_ids || (booking_id ? [booking_id] : []);
    if (!ids.length) return {};
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("booking")
      .update({ trainer_paid: true, trainer_paid_date: today, updated_date: nowISO() })
      .in("id", ids);
    if (error) throw enrich(error);
    return {};
  },

  async UpdateMemberProfile({ member_id, full_name, phone, email }) {
    const patch = { updated_date: nowISO() };
    if (full_name !== undefined) patch.full_name = full_name;
    if (phone !== undefined) patch.phone = phone;
    if (email !== undefined) patch.email = email;
    const { data, error } = await supabase
      .from("member")
      .update(patch)
      .eq("id", member_id)
      .select("*")
      .single();
    if (error) throw enrich(error);
    return { member: data };
  },

  async RegisterMember(form) {
    const row = clean(form);
    if (!row.id) row.id = genId();
    row.created_date = row.created_date || nowISO();
    row.updated_date = row.updated_date || nowISO();
    if (currentUserId && !row.created_by_id) row.created_by_id = currentUserId;
    const { data, error } = await supabase.from("member").insert(row).select("*").single();
    if (error) throw enrich(error);
    return { member: data };
  },

  async CreateBooking(args) {
    const row = clean(args);
    if (!row.id) row.id = genId();
    row.created_date = row.created_date || nowISO();
    row.updated_date = row.updated_date || nowISO();
    if (currentUserId && !row.created_by_id) row.created_by_id = currentUserId;
    const { data, error } = await supabase.from("booking").insert(row).select("*").single();
    if (error) throw enrich(error);
    return { booking: data };
  },

  async SaveProgress({ member_id, date, weight, notes }) {
    const row = {
      member_id,
      date,
      weight: weight !== undefined ? weight : null,
      notes: notes || null,
      id: genId(),
      created_date: nowISO(),
      updated_date: nowISO(),
    };
    if (currentUserId) row.created_by_id = currentUserId;
    const { error } = await supabase.from("progress").insert(row);
    if (error) throw enrich(error);
    return {};
  },

  async SaveAgreement({ id, ...payload }) {
    const row = clean(payload);
    if (id) {
      row.updated_date = nowISO();
      const { data, error } = await supabase
        .from("agreement")
        .update(row)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw enrich(error);
      return { agreement: data };
    }
    if (!row.id) row.id = genId();
    row.created_date = row.created_date || nowISO();
    row.updated_date = row.updated_date || nowISO();
    if (currentUserId && !row.created_by_id) row.created_by_id = currentUserId;
    const { data, error } = await supabase.from("agreement").insert(row).select("*").single();
    if (error) throw enrich(error);
    return { agreement: data };
  },

  async GetOrderStatus({ reference }) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();
    if (error) throw enrich(error);
    return { order: data };
  },

  async GetEmployeeAccess({ email }) {
    const { data, error } = await supabase
      .from("employee")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) throw enrich(error);
    return { employee: data };
  },

  async LoginWithSRNumber({ srNumber }) {
    let { data, error } = await supabase
      .from("member")
      .select("*")
      .eq("card_id", srNumber)
      .maybeSingle();
    if (error) throw enrich(error);
    if (!data) {
      const r2 = await supabase.from("member").select("*").eq("id_number", srNumber).maybeSingle();
      data = r2.data;
    }
    if (!data) throw new Error("Invalid SR number.");
    return { member: data };
  },

  async LoginWithEMPNumber({ empNumber }) {
    const { data, error } = await supabase
      .from("employee")
      .select("*")
      .eq("emp_number", empNumber)
      .maybeSingle();
    if (error) throw enrich(error);
    if (!data) throw new Error("Invalid employee number.");
    let member = null;
    if (data.member_id) {
      const m = await supabase.from("member").select("*").eq("id", data.member_id).maybeSingle();
      member = m.data;
    }
    return { employee: data, member };
  },

  async InviteEmployee(form) {
    const row = clean(form);
    if (!row.id) row.id = genId();
    if (!row.emp_number) row.emp_number = String(Math.floor(1000 + Math.random() * 9000));
    row.invited_date = row.invited_date || nowISO().slice(0, 10);
    row.active = row.active ?? true;
    row.created_date = row.created_date || nowISO();
    row.updated_date = row.updated_date || nowISO();
    if (currentUserId && !row.created_by_id) row.created_by_id = currentUserId;
    const { data, error } = await supabase.from("employee").insert(row).select("*").single();
    if (error) throw enrich(error);
    return { employee: data };
  },

  async RecalculateMemberCredit(/* { member_id } */) {
    // Original business logic for credit recalculation lived in the Base44 backend and is not
    // available here. Left as a no-op so the member view still reloads; recompute the exact
    // credit_balance/credit_streak fields once the original logic is recovered.
    console.warn("RecalculateMemberCredit: not reimplemented (original logic unavailable).");
    return {};
  },

  // --- External-service functions: backed by Supabase Edge Functions ---
  async CreateYocoCheckout(args) {
    const { data, error } = await supabase.functions.invoke("create-yoco-checkout", {
      body: args,
    });
    if (error) throw enrich(error);
    if (data?.error) throw new Error(data.error);
    return data;
  },
  async SendSRReminder() {
    throw new Error(
      "SendSRReminder requires a Supabase Edge Function with an email/SMS provider. Deploy it to restore reminders."
    );
  },
};

const functions = {
  async invoke(name, args) {
    const fn = FN[name];
    if (!fn) throw new Error(`Backend function "${name}" is not implemented in the Supabase backend.`);
    return { data: await fn(args || {}) };
  },
};

const integrations = {
  Core: {
    async UploadPublicFile({ file, bucket = "media" }) {
      const path = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw enrich(error);
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      return { file_url: pub.publicUrl };
    },
    async UploadPrivateFile({ file, bucket = "documents" }) {
      const path = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw enrich(error);
      return { file_uri: path };
    },
    async SendEmail() {
      throw new Error(
        "SendEmail requires a Supabase Edge Function with an email provider (e.g. Resend). Deploy it to restore emails."
      );
    },
    async InvokeLLM() {
      throw new Error(
        "InvokeLLM requires a Supabase Edge Function with an AI provider. Deploy it to restore AI scoring."
      );
    },
    async ExtractDataFromUploadedFile({ file: fileObj, file_url, json_schema }) {
      // Client-side PDF text extraction via pdfjs-dist (no Edge Function / AI API needed).
      // The caller passes the File object directly (`file`); falls back to downloading
      // from Supabase Storage when only a path (`file_url`) is provided.
      const { extractPdfText, parseDebitRows } = await import("@/lib/pdfExtract");

      let blob = fileObj;
      if (!blob && file_url) {
        // file_url is the storage path returned by UploadPrivateFile
        const { data, error } = await supabase.storage
          .from("documents")
          .download(file_url);
        if (error) throw enrich(error);
        blob = data;
      }
      if (!blob) throw new Error("No file provided for extraction.");

      const text = await extractPdfText(blob);
      const records = parseDebitRows(text);
      return { status: "success", output: { records } };
    },
  },
};

const users = {
  async inviteUser(/* email, role */) {
    throw new Error(
      "users.inviteUser requires a Supabase Edge Function with the service_role key to create auth users. Deploy it to restore invites."
    );
  },
};

export const base44 = { entities, auth, functions, integrations, users };

// Keep the profile id in sync whenever the session changes (so create() can stamp created_by_id).
(async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) await auth.me().catch(() => {});
  } catch {
    /* ignore during module init */
  }
})();

supabase.auth.onAuthStateChange((_e, session) => {
  if (session?.user) auth.me().catch(() => {});
  else currentUserId = null;
});
