import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dumbbell, Loader2, Calendar, Clock, Users, User } from "lucide-react";

const PRICES = { "One-on-One": 50, "Two-Person": 70 };

export default function BookPtView({ member }) {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    trainer_id: "",
    session_type: "One-on-One",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    second_participant: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await base44.functions.invoke("GetMemberPortalData", { member_id: member.id });
      setTrainers(res.data?.trainers || []);
      setBookings(res.data?.bookings || []);
    } catch (e) {
      setErr(e?.message || "Could not load.");
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, [member.id]);

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const trainer = trainers.find((t) => t.id === form.trainer_id);
  const price = PRICES[form.session_type] || 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.trainer_id) { setErr("Select a trainer."); return; }
    if (!form.date || !form.time) { setErr("Choose a date and time."); return; }
    if (form.session_type === "Two-Person" && !form.second_participant.trim()) { setErr("Enter the second participant's name."); return; }
    setSaving(true);
    setErr("");
    try {
      await base44.functions.invoke("CreateBooking", {
        member_id: member.id,
        member_name: member.full_name,
        member_phone: member.phone,
        trainer_id: form.trainer_id,
        trainer_name: trainer?.name || "",
        session_type: form.session_type,
        price,
        date: form.date,
        time: form.time,
        second_participant: form.session_type === "Two-Person" ? form.second_participant : undefined,
        notes: form.notes || undefined,
        status: "pending",
      });
      setForm((f) => ({ ...f, second_participant: "", notes: "" }));
      load();
    } catch (e2) {
      setErr(e2?.message || "Could not book. Try again.");
    }
    setSaving(false);
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const tone = (s) => (s === "confirmed" ? "text-primary" : s === "cancelled" ? "text-destructive" : s === "completed" ? "text-muted-foreground" : "text-accent");

  return (
    <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-5 lg:items-start">
      <div className="lg:col-span-2">
        <h3 className="font-display text-sm tracking-wide mb-1">BOOK A PERSONAL TRAINER</h3>
        <p className="text-xs text-muted-foreground mb-3">One-on-One session <span className="text-primary font-semibold">R50</span> · Two-Person session <span className="text-primary font-semibold">R35/person</span> (R70 total).</p>
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-primary/20 bg-white/[0.02] p-4 space-y-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Trainer</span>
          <select value={form.trainer_id} onChange={(e) => upd("trainer_id", e.target.value)} style={{ colorScheme: "dark" }} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
            <option value="" className="bg-card text-foreground">Select a trainer…</option>
            {trainers.map((t) => <option key={t.id} value={t.id} className="bg-card text-foreground">{t.name} — {t.specialty}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Session</span>
            <select value={form.session_type} onChange={(e) => upd("session_type", e.target.value)} style={{ colorScheme: "dark" }} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
              <option value="One-on-One" className="bg-card text-foreground">One-on-One · R50</option>
              <option value="Two-Person" className="bg-card text-foreground">Two-Person · R35/person</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Price</span>
            <div className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/10 px-3 py-2.5 text-sm text-primary font-semibold">R{price}</div>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Date</span>
            <input type="date" value={form.date} onChange={(e) => upd("date", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Time</span>
            <input type="time" value={form.time} onChange={(e) => upd("time", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </label>
        </div>
        {form.session_type === "Two-Person" && (
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Second participant</span>
            <input value={form.second_participant} onChange={(e) => upd("second_participant", e.target.value)} placeholder="Name of the second person" className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary" />
          </label>
        )}
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Notes (optional)</span>
          <input value={form.notes} onChange={(e) => upd("notes", e.target.value)} placeholder="Focus area, goals…" className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </label>
        {err && <p className="text-xs text-destructive">{err}</p>}
        <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Dumbbell className="w-4 h-4" />} Request booking
        </button>
      </form>

      <div>
        <h3 className="font-display text-sm tracking-wide mb-3">YOUR BOOKINGS</h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No bookings yet. Request one above.</p>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="rounded-xl border border-primary/15 bg-white/[0.03] p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{b.trainer_name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5"><Calendar className="w-3 h-3" />{b.date} · <Clock className="w-3 h-3" />{b.time}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">{b.session_type === "Two-Person" ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />} {b.session_type} · R{b.price}</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase ${tone(b.status)}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}