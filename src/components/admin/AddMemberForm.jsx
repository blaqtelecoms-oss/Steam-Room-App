import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Loader2 } from "lucide-react";

const EMPTY = {
  full_name: "",
  email: "",
  phone: "",
  card_id: "",
  id_type: "RSA ID",
  id_number: "",
  membership_tier: "Pro",
  date_joined: new Date().toISOString().slice(0, 10),
  status: "active",
};

export default function AddMemberForm({ onDone }) {
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!f.full_name) { setErr("Full name is required."); return; }
    setSaving(true);
    setErr("");
    try {
      await base44.entities.Member.create({
        full_name: f.full_name,
        email: f.email || undefined,
        phone: f.phone || undefined,
        card_id: f.card_id || undefined,
        id_type: f.id_type || "RSA ID",
        id_number: f.id_number || undefined,
        membership_tier: f.membership_tier,
        date_joined: f.date_joined,
        status: f.status,
      });
      onDone();
    } catch (e) {
      setErr(e?.message || "Failed to add member.");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-card p-4 space-y-3">
      <h3 className="font-display text-[11px] tracking-widest text-primary">ADD NEW MEMBER</h3>
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Full Name *" value={f.full_name} onChange={(v) => upd("full_name", v)} />
        <Inp label="Card ID" value={f.card_id} onChange={(v) => upd("card_id", v)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">ID Type</span>
          <select value={f.id_type} onChange={(e) => upd("id_type", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="RSA ID">RSA ID</option>
            <option value="Other ID">Other ID</option>
          </select>
        </label>
        <Inp label="ID Number" value={f.id_number} onChange={(v) => upd("id_number", v)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Email" value={f.email} onChange={(v) => upd("email", v)} />
        <Inp label="Phone" value={f.phone} onChange={(v) => upd("phone", v)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Tier</span>
          <select value={f.membership_tier} onChange={(e) => upd("membership_tier", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="Starter">Starter</option>
            <option value="Pro">Pro</option>
            <option value="Elite">Elite</option>
          </select>
        </label>
        <Inp label="Date Joined" type="date" value={f.date_joined} onChange={(v) => upd("date_joined", v)} />
      </div>
      {err && <p className="text-xs text-destructive">{err}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={saving} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Member
        </button>
        <button onClick={onDone} className="text-xs text-muted-foreground px-3 py-2">Cancel</button>
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}