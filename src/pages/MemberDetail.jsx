import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Save, Plus, Trash2, Loader2, CreditCard, Receipt, Wallet, RefreshCw, TrendingUp, FileText, FileSignature, Send, Mail, Snowflake, KeyRound, CheckCircle } from "lucide-react";
import MandateTab from "@/components/admin/MandateTab";
import AgreementsTab from "@/components/admin/AgreementsTab";

const TIERS = ["Starter", "Pro", "Elite"];
const PAY_TYPES = ["membership", "joining_fee", "merchandise", "credit"];
const STATUSES = ["paid", "pending", "overdue"];

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [recalcing, setRecalcing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState("profile");

  const load = async () => {
    const [m, pays] = await Promise.all([
      base44.entities.Member.get(id),
      base44.entities.Payment.filter({ member_id: id }, "-date", 200),
    ]);
    setMember(m);
    setPayments(pays || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const recalc = async () => {
    setRecalcing(true);
    try {
      await base44.functions.invoke("RecalculateMemberCredit", { member_id: id });
    } catch (e) { /* bubble */ }
    await load();
    setRecalcing(false);
  };

  const upd = (k, v) => setMember((m) => ({ ...m, [k]: v }));

  const toggleFreeze = async () => {
    setBusy(true);
    const next = member.status === "frozen" ? "active" : "frozen";
    await base44.entities.Member.update(id, { status: next });
    setMember((m) => ({ ...m, status: next }));
    setBusy(false);
  };

  const sendEmailReminder = async () => {
    if (!member.email) return;
    setBusy(true);
    try {
      await base44.integrations.Core.SendEmail({ to: member.email, subject: "SR FITS — Payment Reminder", body: `Hi ${member.full_name},\n\nYou have an outstanding balance of R${balance.toFixed(2)} on your account. Please settle to keep your membership active.\n\n— Steam Room Fitness Center` });
      setMsg("Reminder email sent.");
    } catch (e) { setMsg(e?.message || "Failed to send email."); }
    setBusy(false);
  };

  const resetPw = async () => {
    if (!member.email) return;
    setBusy(true);
    try {
      await base44.integrations.Core.SendEmail({ to: member.email, subject: "SR FITS — Password Reset", body: `Hi ${member.full_name},\n\nA password reset was requested for your SR FITS account. Please open the app, log out, and use the "Forgot Password" link on the login screen to set a new password.\n\n— Steam Room Fitness Center` });
      setMsg("Password reset email sent.");
    } catch (e) { setMsg(e?.message || "Failed to send email."); }
    setBusy(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Member.update(id, {
        full_name: member.full_name,
        phone: member.phone,
        email: member.email,
        membership_tier: member.membership_tier,
        status: member.status,
        card_id: member.card_id,
        id_type: member.id_type || "RSA ID",
        id_number: member.id_number || undefined,
        date_joined: member.date_joined,
        contract_start_date: member.contract_start_date,
        contract_length_months: member.contract_length_months ? Number(member.contract_length_months) : null,
        joining_fee: member.joining_fee ? Number(member.joining_fee) : null,
        monthly_premium: member.monthly_premium ? Number(member.monthly_premium) : null,
        next_payment_date: member.next_payment_date,
        next_payment_amount: member.next_payment_amount ? Number(member.next_payment_amount) : null,
      });
      setMsg("Saved.");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg(e?.message || "Save failed.");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  if (!member) return <p className="text-sm text-muted-foreground">Member not found.</p>;

  const balance = (payments || [])
    .filter((p) => p.status !== "paid")
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const paidTotal = (payments || [])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const creditLimit = Number(member.credit_limit ?? 500);
  const creditBalance = (payments || [])
    .filter((p) => p.type === "credit" && p.status !== "paid")
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const available = Math.max(0, creditLimit - creditBalance);
  const streak = Number(member.credit_streak ?? 0);
  const goodCount = (payments || []).filter((p) => p.status === "paid" && ["membership", "joining_fee", "credit"].includes(p.type)).length;
  const overdueCount = (payments || []).filter((p) => p.status === "overdue").length;
  const limitPct = Math.min(100, (creditBalance / creditLimit) * 100);

  return (
    <div className="pt-16 pb-8 px-4 min-h-screen space-y-4 lg:pt-24 lg:pb-16 lg:px-8 lg:max-w-4xl lg:mx-auto">
      <button onClick={() => navigate("/admin")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to Admin
      </button>

      {/* Member header */}
      <div className="rounded-2xl border border-primary/25 bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-space font-bold text-lg">{member.full_name}</h1>
            <p className="text-xs text-muted-foreground">{member.card_id} · {member.membership_tier}</p>
          </div>
          <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${member.status === "active" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>{member.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
          <div>
            <p className="text-muted-foreground">Outstanding balance</p>
            <p className={`font-bold text-base ${balance > 0 ? "text-destructive" : "text-primary"}`}>R {balance.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total paid</p>
            <p className="font-bold text-base text-primary">R {paidTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-primary/15 bg-card p-4">
        <p className="font-display text-[10px] tracking-widest text-primary mb-3">QUICK ACTIONS</p>
        <div className="flex flex-wrap gap-2">
          {member.phone && balance > 0 && (
            <a href={`https://wa.me/${member.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${member.full_name}, you have an outstanding balance of R${balance.toFixed(0)} on your SR FITS account. Please settle to keep your membership active. Thank you!`)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-2 hover:bg-primary/10">
              <Send className="w-3.5 h-3.5 text-primary" /> WhatsApp reminder
            </a>
          )}
          {member.email && balance > 0 && (
            <button onClick={sendEmailReminder} disabled={busy} className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-2 hover:bg-primary/10 disabled:opacity-60">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />} Email reminder
            </button>
          )}
          <button onClick={toggleFreeze} disabled={busy} className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-2 hover:bg-primary/10 disabled:opacity-60">
            {member.status === "frozen" ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Snowflake className="w-3.5 h-3.5" />}
            {member.status === "frozen" ? "Activate" : "Freeze"}
          </button>
          {member.email && (
            <button onClick={resetPw} disabled={busy} className="flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-2 hover:bg-primary/10 disabled:opacity-60">
              <KeyRound className="w-3.5 h-3.5" /> Reset password
            </button>
          )}
        </div>
        {msg && <p className="text-xs text-primary mt-2">{msg}</p>}
      </div>

      {/* Credit facility */}
      <div className="rounded-2xl border border-primary/25 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-[10px] tracking-widest text-primary flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> CREDIT FACILITY
          </p>
          <button onClick={recalc} disabled={recalcing} className="flex items-center gap-1 text-xs font-semibold text-primary border border-primary/20 rounded-lg px-3 py-1.5 hover:bg-primary/10">
            {recalcing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Recalc
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/[0.03] border border-primary/10 p-2.5">
            <p className="text-[10px] uppercase text-muted-foreground">Limit</p>
            <p className="font-bold text-base text-primary">R {creditLimit.toFixed(0)}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-primary/10 p-2.5">
            <p className="text-[10px] uppercase text-muted-foreground">Owed</p>
            <p className={`font-bold text-base ${creditBalance > 0 ? "text-accent" : "text-foreground"}`}>R {creditBalance.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-primary/10 p-2.5">
            <p className="text-[10px] uppercase text-muted-foreground">Available</p>
            <p className="font-bold text-base text-primary">R {available.toFixed(2)}</p>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${limitPct}%` }} />
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-primary" /> {goodCount} good · {overdueCount} overdue</span>
          <span>Streak: <span className="text-primary font-semibold">{streak}</span> · max R2000</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Credit starts at R500 and grows by R250 per net on-time payment (on-time minus overdue), capped at R2000. Use it for products and merchandise sold at the gym — record a purchase as a <span className="text-primary font-semibold">credit</span> type payment.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2">
        {[
          { id: "profile", label: "Profile", icon: null },
          { id: "payments", label: "Payments", icon: Receipt },
          { id: "mandate", label: "Mandate", icon: FileText },
          { id: "forms", label: "Forms", icon: FileSignature },
        ].map((t) => {
          const active = section === t.id;
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setSection(t.id)} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide whitespace-nowrap border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-primary/20 text-muted-foreground"}`}>
              {Icon && <Icon className="w-3.5 h-3.5" />} {t.label}
            </button>
          );
        })}
      </div>

      {/* Editable details */}
      {section === "profile" && (
      <div className="rounded-2xl border border-primary/15 bg-card p-4 space-y-3">
        <p className="font-display text-[10px] tracking-widest text-primary">DETAILS</p>
        <Field label="Full name" value={member.full_name || ""} onChange={(v) => upd("full_name", v)} />
        <Field label="Email" value={member.email || ""} onChange={(v) => upd("email", v)} type="email" />
        <Field label="Phone" value={member.phone || ""} onChange={(v) => upd("phone", v)} />
        <Field label="Card / Membership No." value={member.card_id || ""} onChange={(v) => upd("card_id", v)} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="ID Type" value={member.id_type || "RSA ID"} options={["RSA ID", "Other ID"]} onChange={(v) => upd("id_type", v)} />
          <Field label="ID Number" value={member.id_number || ""} onChange={(v) => upd("id_number", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Tier" value={member.membership_tier || "Pro"} options={TIERS} onChange={(v) => upd("membership_tier", v)} />
          <SelectField label="Status" value={member.status || "active"} options={["active", "frozen", "expired"]} onChange={(v) => upd("status", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date joined" value={member.date_joined || ""} onChange={(v) => upd("date_joined", v)} type="date" />
          <Field label="Contract start" value={member.contract_start_date || ""} onChange={(v) => upd("contract_start_date", v)} type="date" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contract length (months)" value={member.contract_length_months ?? ""} onChange={(v) => upd("contract_length_months", v)} type="number" />
          <Field label="Joining fee (R)" value={member.joining_fee ?? ""} onChange={(v) => upd("joining_fee", v)} type="number" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monthly premium (R)" value={member.monthly_premium ?? ""} onChange={(v) => upd("monthly_premium", v)} type="number" />
          <Field label="Next payment amount (R)" value={member.next_payment_amount ?? ""} onChange={(v) => upd("next_payment_amount", v)} type="number" />
        </div>
        <Field label="Next payment date" value={member.next_payment_date || ""} onChange={(v) => upd("next_payment_date", v)} type="date" />

        <div className="flex items-center gap-2 pt-1">
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
          </button>
          {msg && <p className="text-xs text-primary">{msg}</p>}
        </div>
      </div>
      )}

      {/* Payment history */}
      {section === "payments" && (
      <div className="rounded-2xl border border-primary/15 bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-display text-[10px] tracking-widest text-primary flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" /> PAYMENTS & CREDIT</p>
          <button onClick={() => setShowAdd((s) => !s)} className="flex items-center gap-1 text-xs font-semibold text-primary border border-primary/20 rounded-lg px-3 py-1.5">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {showAdd && <AddPayment memberId={id} onDone={() => { setShowAdd(false); recalc(); }} />}

        {payments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <PaymentRow key={p.id} payment={p} onChanged={recalc} />
            ))}
          </div>
        )}
      </div>
      )}

      {section === "mandate" && <MandateTab memberId={id} memberName={member.full_name} />}
      {section === "forms" && <AgreementsTab memberId={id} memberName={member.full_name} />}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function AddPayment({ memberId, onDone }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("membership");
  const [status, setStatus] = useState("paid");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!amount) return;
    setSaving(true);
    try {
      await base44.entities.Payment.create({
        member_id: memberId,
        amount: Number(amount),
        date,
        type,
        status,
        description,
      });
      onDone();
    } catch (e) { /* bubble */ }
    setSaving(false);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-white/[0.02] p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Amount (R)" value={amount} onChange={setAmount} type="number" />
        <Field label="Date" value={date} onChange={setDate} type="date" />
        <SelectField label="Type" value={type} options={PAY_TYPES} onChange={setType} />
        <SelectField label="Status" value={status} options={STATUSES} onChange={setStatus} />
      </div>
      <Field label="Description (item / note)" value={description} onChange={setDescription} />
      <button onClick={submit} disabled={saving} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Record payment
      </button>
    </div>
  );
}

function PaymentRow({ payment, onChanged }) {
  const [busy, setBusy] = useState(false);
  const togglePaid = async () => {
    setBusy(true);
    const next = payment.status === "paid" ? "pending" : "paid";
    await base44.entities.Payment.update(payment.id, { status: next });
    setBusy(false);
    onChanged();
  };
  const del = async () => {
    setBusy(true);
    await base44.entities.Payment.delete(payment.id);
    setBusy(false);
    onChanged();
  };
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/10 bg-white/[0.02] px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{payment.description || payment.type}</p>
        <p className="text-[10px] text-muted-foreground">{payment.type} · {payment.date} · {payment.method || "—"}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold">R {Number(payment.amount || 0).toFixed(2)}</span>
        <button onClick={togglePaid} disabled={busy} className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${payment.status === "paid" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
          {payment.status}
        </button>
        <button onClick={del} disabled={busy} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}