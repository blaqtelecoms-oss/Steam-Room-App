import { adminClient, nowISO } from "../_shared/supabase.ts";
import { computeCredit } from "../_shared/credit.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

// Receives signed Yoco webhook events for our checkouts. Verifies the
// Standard Webhooks signature (webhook-id, webhook-timestamp, webhook-signature),
// rejects stale (>3 min) or unsigned requests, then reconciles the event to our
// Order and settles it. Yoco's "payment.created" event is the success signal.

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function verifySignature(req: Request, rawBody: string): Promise<boolean> {
  const id = req.headers.get("webhook-id");
  const ts = req.headers.get("webhook-timestamp");
  const sig = req.headers.get("webhook-signature");
  if (!id || !ts || !sig) return false;

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  const ageMs = Math.abs(Date.now() - tsNum * 1000);
  if (ageMs > 3 * 60 * 1000) return false;

  const secretStr = Deno.env.get("YOCO_WEBHOOK_SECRET") || "";
  if (!secretStr) return false;
  const cleaned = secretStr.startsWith("whsec_") ? secretStr.slice(6) : secretStr;

  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      base64ToBytes(cleaned) as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  } catch {
    return false;
  }

  const data = new TextEncoder().encode(`${id}.${ts}.${rawBody}`);
  const signature = await crypto.subtle.sign("HMAC", key, data as BufferSource);
  const expected = bytesToBase64(new Uint8Array(signature));

  const sigs = sig.split(" ").map((s) => s.split(",")[1]).filter(Boolean);
  return sigs.some((s) => s === expected);
}

async function fetchCheckout(supabase: any, secretKey: string, yocoOrderId: string) {
  if (!secretKey || !yocoOrderId) return null;
  try {
    const r = await fetch(`https://payments.yoco.com/api/checkouts/${encodeURIComponent(yocoOrderId)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!r.ok) return null;
    const c: any = await r.json();
    const ref = c?.metadata?.reference;
    let order: any = null;
    if (ref) {
      const { data } = await supabase.from("orders").select("*").eq("reference", ref).limit(1);
      order = data?.[0];
    }
    return {
      order,
      status: String(c?.status || "").toLowerCase(),
      amountCents: typeof c?.amount === "number" ? c.amount : null,
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const ok = await verifySignature(req, rawBody);
    if (!ok) return jsonResponse({ error: "Invalid signature" }, 401);

    const body = JSON.parse(rawBody);
    const eventType = String(body?.event_type || "").toLowerCase();
    const yocoOrderId = body?.order_id || "";
    const yocoPaymentId = body?.payment_id || body?.paymentId || "";

    const supabase = adminClient();
    const secretKey = Deno.env.get("YOCO_SECRET_KEY") || "";

    // Reconcile: fetch the checkout from Yoco, fall back to payment_reference match
    let order: any = null;
    let checkoutStatus = "";
    let checkoutAmountCents: number | null = null;

    const fetched = await fetchCheckout(supabase, secretKey, yocoOrderId);
    if (fetched) {
      order = fetched.order;
      checkoutStatus = fetched.status;
      checkoutAmountCents = fetched.amountCents;
    }
    if (!order && yocoOrderId) {
      const { data } = await supabase.from("orders").select("*").eq("payment_reference", yocoOrderId).limit(1);
      order = data?.[0];
    }
    if (!order) return jsonResponse({ error: "Order not found" }, 404);

    const isSuccess = eventType === "payment.created" || eventType === "payment.succeeded";
    const isRefund = eventType === "payment.refunded";

    if (isSuccess) {
      if (checkoutStatus && checkoutStatus !== "completed") {
        return jsonResponse({ ok: true, reference: order.reference, status: "pending" });
      }

      if (checkoutAmountCents != null && Math.round(Number(order.amount) * 100) !== checkoutAmountCents) {
        return jsonResponse({ error: "Amount mismatch" }, 400);
      }

      // Idempotent: already settled
      if (order.status === "paid") {
        return jsonResponse({ ok: true, reference: order.reference, status: "paid", idempotent: true });
      }

      await supabase.from("orders").update({ status: "paid", updated_date: nowISO() }).eq("id", order.id);

      const today = new Date().toISOString().slice(0, 10);

      if (order.type === "merchandise") {
        await supabase.from("payment").insert({
          member_id: order.member_id,
          amount: Number(order.amount),
          date: today,
          type: "merchandise",
          status: "paid",
          method: "Yoco",
          description: `Merchandise order ${order.reference}`,
        });
      } else if (order.payment_id) {
        await supabase.from("payment").update({
          status: "paid",
          method: "Yoco",
          updated_date: nowISO(),
        }).eq("id", order.payment_id);
      } else {
        await supabase.from("payment").insert({
          member_id: order.member_id,
          amount: Number(order.amount),
          date: today,
          type: order.type,
          status: "paid",
          method: "Yoco",
          description: order.description || order.type,
        });
      }

      // Keep credit facility in sync for billable dues
      if (order.member_id && order.type !== "merchandise") {
        try {
          const { data: payments } = await supabase
            .from("payment")
            .select("*")
            .eq("member_id", order.member_id)
            .order("date", { ascending: false })
            .limit(500);
          const { streak, creditLimit, creditBalance } = computeCredit(payments || []);
          await supabase.from("member").update({
            credit_limit: creditLimit,
            credit_balance: creditBalance,
            credit_streak: streak,
            updated_date: nowISO(),
          }).eq("id", order.member_id);
        } catch { /* credit sync is best-effort */ }
      }

      return jsonResponse({ ok: true, reference: order.reference, status: "paid" });
    }

    if (isRefund) {
      return jsonResponse({ ok: true, reference: order.reference, status: "refunded" });
    }

    return jsonResponse({ ok: true, reference: order.reference, status: "acknowledged" });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
});
