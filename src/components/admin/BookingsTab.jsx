import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Calendar, Clock, Check, X, Trash2 } from "lucide-react";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTrainer, setFilterTrainer] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const load = async () => {
    const [bks, trs] = await Promise.all([
      base44.entities.Booking.filter({}, "-date", 500),
      base44.entities.Trainer.filter({}, "order", 100),
    ]);
    setBookings(bks || []);
    setTrainers(trs || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (b, status) => {
    await base44.entities.Booking.update(b.id, { status });
    load();
  };
  const remove = async (b) => {
    await base44.entities.Booking.delete(b.id);
    load();
  };

  const filtered = bookings.filter((b) =>
    (!filterTrainer || b.trainer_id === filterTrainer) &&
    (!filterStatus || b.status === filterStatus)
  );

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const tone = (s) => (s === "confirmed" ? "text-primary" : s === "cancelled" ? "text-destructive" : s === "completed" ? "text-muted-foreground" : "text-accent");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <select value={filterTrainer} onChange={(e) => setFilterTrainer(e.target.value)} className="rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-xs">
          <option value="">All trainers</option>
          {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-xs">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} bookings</span>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No bookings yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <div key={b.id} className="rounded-xl border border-primary/15 bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{b.member_name}</p>
                  <p className="text-[11px] text-muted-foreground">{b.trainer_name} · {b.session_type} · R{b.price}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5"><Calendar className="w-3 h-3" />{b.date} · <Clock className="w-3 h-3" />{b.time}</p>
                  {b.second_participant && <p className="text-[10px] text-muted-foreground mt-0.5">With: {b.second_participant}</p>}
                  {b.member_phone && <p className="text-[10px] text-muted-foreground mt-0.5">{b.member_phone}</p>}
                  {b.notes && <p className="text-[10px] text-muted-foreground mt-0.5 italic">"{b.notes}"</p>}
                </div>
                <span className={`text-[10px] font-semibold uppercase shrink-0 ${tone(b.status)}`}>{b.status}</span>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {b.status !== "confirmed" && <button onClick={() => setStatus(b, "confirmed")} className="flex items-center gap-1 text-[10px] font-semibold uppercase bg-primary/15 text-primary rounded-full px-2.5 py-1"><Check className="w-3 h-3" /> Confirm</button>}
                {b.status !== "completed" && <button onClick={() => setStatus(b, "completed")} className="flex items-center gap-1 text-[10px] font-semibold uppercase bg-white/5 text-muted-foreground rounded-full px-2.5 py-1"><Check className="w-3 h-3" /> Complete</button>}
                {b.status !== "cancelled" && <button onClick={() => setStatus(b, "cancelled")} className="flex items-center gap-1 text-[10px] font-semibold uppercase bg-destructive/15 text-destructive rounded-full px-2.5 py-1"><X className="w-3 h-3" /> Cancel</button>}
                <button onClick={() => remove(b)} className="flex items-center gap-1 text-[10px] font-semibold uppercase bg-white/5 text-muted-foreground rounded-full px-2.5 py-1 ml-auto"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}