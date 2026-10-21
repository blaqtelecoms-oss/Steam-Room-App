import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { User, Phone, Mail, Save, Loader2, LogOut, ShieldCheck, CalendarDays, Hash } from "lucide-react";

export default function ProfileView({ member, onUpdate, onLock }) {
  const [form, setForm] = useState({
    full_name: member.full_name || "",
    phone: member.phone || "",
    email: member.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await base44.functions.invoke("UpdateMemberProfile", {
        member_id: member.id,
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
      });
      onUpdate(res.data.member);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e?.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 lg:max-w-3xl">
      <div className="rounded-2xl border border-primary/25 bg-white/[0.03] p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <p className="font-semibold text-sm">Membership</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow icon={User} label="Tier" value={member.membership_tier} />
          <InfoRow icon={ShieldCheck} label="Status" value={member.status} />
          <InfoRow icon={CalendarDays} label="Member since" value={member.date_joined ? new Date(member.date_joined).toLocaleDateString("en-ZA") : "—"} />
          <InfoRow icon={Hash} label="SR number" value={member.card_id || "—"} />
        </div>
      </div>

      <div className="rounded-2xl border border-primary/15 bg-white/[0.03] p-4 space-y-4">
        <p className="font-display text-sm tracking-wide">EDIT DETAILS</p>
        <Field icon={User} label="Full name">
          <input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="Full name" />
        </Field>
        <Field icon={Phone} label="Phone">
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="Phone number" />
        </Field>
        <Field icon={Mail} label="Email">
          <input value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full bg-transparent outline-none text-sm" placeholder="Email address" />
        </Field>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saved ? "Saved" : "Save changes"}
        </button>
      </div>

      <button onClick={onLock} className="w-full flex items-center justify-center gap-2 rounded-xl border border-destructive/30 text-destructive py-3 text-sm font-semibold uppercase tracking-wide hover:bg-destructive/10">
        <LogOut className="w-4 h-4" /> Log out
      </button>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
        <p className="font-medium capitalize truncate">{value}</p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-primary/20 bg-background px-3 py-2.5">
        <Icon className="w-4 h-4 text-primary/60 shrink-0" />
        {children}
      </div>
    </label>
  );
}