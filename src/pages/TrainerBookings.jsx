import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dumbbell, Loader2, Calendar, Clock, Users, User } from "lucide-react";

export default function TrainerBookings() {
  const [trainers, setTrainers] = useState([]);
  const [trainerId, setTrainerId] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    base44.entities.Trainer.filter({ active: true }, "order", 100)
      .then((res) => { setTrainers(res || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const select = async (id) => {
    setTrainerId(id);
    if (!id) { setBookings([]); return; }
    setFetching(true);
    try {
      const res = await base44.functions.invoke("GetTrainerBookings", { trainer_id: id });
      setBookings(res.data?.bookings || []);
    } catch {
      setBookings([]);
    }
    setFetching(false);
  };

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== "cancelled");
  const past = bookings.filter((b) => b.date < today || b.status === "cancelled");

  const tone = (s) => (s === "confirmed" ? "text-primary" : s === "cancelled" ? "text-destructive" : s === "completed" ? "text-muted-foreground" : "text-accent");

  if (loading) return <div className="pt-24 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div className="pt-24 px-4 pb-10 min-h-screen lg:pt-28 lg:px-8 lg:max-w-4xl lg:mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-display text-[10px] tracking-widest text-primary">SR FITS</p>
          <h1 className="font-space font-bold text-xl">Trainer Bookings</h1>
        </div>
      </div>
      <label className="block mb-4">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Select your name</span>
        <select value={trainerId} onChange={(e) => select(e.target.value)} style={{ colorScheme: "dark" }} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
          <option value="">Choose your trainer profile…</option>
          {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>

      {!trainerId ? (
        <p className="text-sm text-muted-foreground text-center py-10">Select your name to see your upcoming sessions.</p>
      ) : fetching ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : (
        <div className="space-y-5">
          <div>
            <h3 className="font-display text-sm tracking-wide mb-3 text-primary">UPCOMING ({upcoming.length})</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming sessions.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((b) => (
                  <div key={b.id} className="rounded-xl border border-primary/15 bg-card p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{b.member_name}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5"><Calendar className="w-3 h-3" />{b.date} · <Clock className="w-3 h-3" />{b.time}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">{b.session_type === "Two-Person" ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />} {b.session_type} · R{b.price}</p>
                        {b.second_participant && <p className="text-[10px] text-muted-foreground mt-0.5">With: {b.second_participant}</p>}
                        {b.member_phone && <p className="text-[10px] text-muted-foreground mt-0.5">📞 {b.member_phone}</p>}
                        {b.notes && <p className="text-[10px] text-muted-foreground mt-0.5 italic">"{b.notes}"</p>}
                      </div>
                      <span className={`text-[10px] font-semibold uppercase ${tone(b.status)}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {past.length > 0 && (
            <div>
              <h3 className="font-display text-sm tracking-wide mb-3 text-muted-foreground">PAST ({past.length})</h3>
              <div className="space-y-2 opacity-60">
                {past.map((b) => (
                  <div key={b.id} className="rounded-xl border border-primary/10 bg-card p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">{b.member_name}</p>
                        <p className="text-[11px] text-muted-foreground">{b.date} · {b.time} · {b.session_type}</p>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase ${tone(b.status)}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}