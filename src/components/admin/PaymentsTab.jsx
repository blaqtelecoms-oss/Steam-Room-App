import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Send, Pencil, Check, Plus, Search } from "lucide-react";

export default function PaymentsTab() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [pays, mems] = await Promise.all([
        base44.entities.Payment.list("-created_date", 500),
        base44.entities.Member.list("-created_date", 500),
      ]);
      setPayments(pays);
      setMembers(mems);
      setLoading(false);
    })();
  }, []);

  const [editing, setEditing] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");

  const memberById = {};
  members.forEach((m) => { memberById[m.id] = m; });

  const changeStatus = async (p, status) => {
    setSavingId(p.id);
    try {
      await base44.entities.Payment.update(p.id, { status });
      setPayments((prev) => prev.map((x) => (x.id === p.id ? { ...x, status } : x)));
      setEditing(null);
    } catch (e) {
      alert(e?.message || "Could not update status.");
    }
    setSavingId(null);
  };

  const reminderLink = (p) => {
    const m = memberById[p.member_id];
    const phone = (m?.phone || "").replace(/[^0-9]/g, "");
    if (!phone) return null;
    const text = encodeURIComponent(`Hi ${m?.full_name || ""}, this is a friendly reminder from SR FITS. Your payment of R${p.amount} (${p.description || "membership"}) is currently ${p.status}. Please settle to keep your membership active. Thank you!`);
    return `https://wa.me/${phone}?text=${text}`;
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground whitespace-nowrap">{payments.length} payment(s)</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search member…"
              className="rounded-lg bg-white/[0.03] border border-primary/20 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary w-40"
            />
          </div>
          <button onClick={() => setShowAdd((s) => !s)} className="flex items-center gap-1 text-xs font-semibold text-primary border border-primary/20 rounded-lg px-3 py-1.5 whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" /> Record payment
          </button>
        </div>
      </div>
      {showAdd && <ManualPaymentForm members={members} onDone={(p) => { setPayments((prev) => [p, ...prev]); setShowAdd(false); }} />}
      {payments.filter((p) => {
        if (!query.trim()) return true;
        const m = memberById[p.member_id];
        return (m?.full_name || "").toLowerCase().includes(query.trim().toLowerCase());
      }).map((p) => {
        const m = memberById[p.member_id];
        const link = reminderLink(p);
        return (
          <div key={p.id} className="rounded-2xl border border-primary/15 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{m?.full_name || "Unknown member"}</p>
                <p className="text-xs text-muted-foreground">{p.description || "Membership"} · {p.date || p.due_date || "—"}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm text-primary">R{p.amount}</p>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${p.status === "paid" ? "bg-primary/15 text-primary" : p.status === "overdue" ? "bg-destructive/15 text-destructive" : "bg-yellow-500/15 text-yellow-400"}`}>{p.status}</span>
              </div>
            </div>
            {p.status !== "paid" && link && (
              <a href={link} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-2 hover:bg-primary/10 w-fit">
                <Send className="w-3.5 h-3.5 text-primary" /> Send WhatsApp Reminder
              </a>
            )}
            {p.status !== "paid" && !link && (
              <p className="mt-3 text-[10px] text-muted-foreground">No phone number on file to send reminder.</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              {editing === p.id ? (
                <>
                  <select
                    value={p.status}
                    onChange={(e) => changeStatus(p, e.target.value)}
                    disabled={savingId === p.id}
                    className="rounded-lg bg-white/[0.03] border border-primary/20 px-2 py-1.5 text-xs outline-none focus:border-primary"
                  >
                    <option value="overdue">Overdue</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                  {savingId === p.id ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  ) : (
                    <button onClick={() => setEditing(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setEditing(p.id)}
                  disabled={savingId === p.id}
                  className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-2 hover:bg-primary/10 disabled:opacity-60"
                >
                  {savingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pencil className="w-3 h-3" />} Edit status
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ManualPaymentForm({ members, onDone }) {
  const [f, setF] = useState({ member_id: "", amount: "", date: new Date().toISOString().slice(0, 10), status: "paid", type: "membership", description: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!f.member_id) { setErr("Select a member."); return; }
    if (!f.amount || Number(f.amount) <= 0) { setErr("Enter an amount."); return; }
    setSaving(true);
    setErr("");
    try {
      const rec = await base44.entities.Payment.create({
        member_id: f.member_id,
        amount: Number(f.amount),
        date: f.date,
        due_date: f.date,
        status: f.status,
        type: f.type,
        description: f.description || (f.status === "paid" ? "Manual payment" : "Manual entry"),
        method: "Manual",
      });
      onDone(rec);
    } catch (e) {
      setErr(e?.message || "Could not save payment.");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-card p-4 space-y-3">
      <p className="font-display text-[10px] tracking-widest text-primary">RECORD MANUAL PAYMENT</p>
      <label className="block">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Member</span>
        <select value={f.member_id} onChange={(e) => upd("member_id", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">Select member…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name} ({m.card_id || "—"})</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Amount (R)</span>
          <input type="number" value={f.amount} onChange={(e) => upd("amount", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Date</span>
          <input type="date" value={f.date} onChange={(e) => upd("date", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</span>
          <select value={f.status} onChange={(e) => upd("status", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Type</span>
          <select value={f.type} onChange={(e) => upd("type", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary">
            <option value="membership">Membership</option>
            <option value="joining_fee">Joining fee</option>
            <option value="merchandise">Merchandise</option>
            <option value="credit">Credit</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Description (optional)</span>
        <input value={f.description} onChange={(e) => upd("description", e.target.value)} placeholder="e.g. Cash payment at front desk" className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      {err && <p className="text-xs text-destructive">{err}</p>}
      <button onClick={submit} disabled={saving} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold disabled:opacity-60">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save payment
      </button>
    </div>
  );
}