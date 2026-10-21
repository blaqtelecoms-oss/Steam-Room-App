import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Check, X, Calendar, Clock, Users, User, Phone, NotebookPen,
  TrendingUp, Wallet, DollarSign, FileDown, Filter, CheckCircle2, Banknote,
} from "lucide-react";
import { jsPDF } from "jspdf";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TrainerAuditDashboard() {
  const [bookings, setBookings] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTrainer, setFilterTrainer] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [paying, setPaying] = useState(null);
  const [view, setView] = useState("audit");

  useEffect(() => {
    (async () => {
      const [bRes, trs] = await Promise.all([
        base44.functions.invoke("GetTrainerBookings", { trainer_id: "admin" }),
        base44.entities.Trainer.list("order", 200),
      ]);
      setBookings(bRes.data?.bookings || []);
      setTrainers(trs);
      setLoading(false);
    })();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const thisMonthKey = today.slice(0, 7);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (filterTrainer !== "all" && b.trainer_id !== filterTrainer) return false;
      if (filterMonth !== "all" && (b.date || "").slice(0, 7) !== filterMonth) return false;
      return true;
    });
  }, [bookings, filterTrainer, filterMonth]);

  const stats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === "completed");
    const todayRevenue = completed
      .filter((b) => b.date === today)
      .reduce((s, b) => s + (Number(b.price) || 0), 0);
    const monthRevenue = completed
      .filter((b) => (b.date || "").slice(0, 7) === thisMonthKey)
      .reduce((s, b) => s + (Number(b.price) || 0), 0);
    const totalUnpaid = completed
      .filter((b) => !b.trainer_paid)
      .reduce((s, b) => s + (Number(b.price) || 0), 0);
    const totalPaid = completed
      .filter((b) => b.trainer_paid)
      .reduce((s, b) => s + (Number(b.price) || 0), 0);
    return { todayRevenue, monthRevenue, totalUnpaid, totalPaid };
  }, [bookings, today, thisMonthKey]);

  // Per-trainer audit
  const trainerAudit = useMemo(() => {
    const map = {};
    bookings.filter((b) => b.status === "completed").forEach((b) => {
      const key = b.trainer_id || "unknown";
      if (!map[key]) {
        map[key] = {
          trainer_id: key,
          trainer_name: b.trainer_name || "Unknown",
          sessions: [],
          total: 0,
          paid: 0,
          unpaid: 0,
          unpaidCount: 0,
        };
      }
      const price = Number(b.price) || 0;
      map[key].sessions.push(b);
      map[key].total += price;
      if (b.trainer_paid) map[key].paid += price;
      else { map[key].unpaid += price; map[key].unpaidCount++; }
    });
    return Object.values(map).sort((a, b) => b.unpaid - a.unpaid);
  }, [bookings]);

  const unpaidCompleted = useMemo(() => {
    return bookings.filter((b) => b.status === "completed" && !b.trainer_paid)
      .filter((b) => filterTrainer === "all" || b.trainer_id === filterTrainer)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [bookings, filterTrainer]);

  const upcoming = useMemo(() => {
    return bookings
      .filter((b) => b.date >= today && b.status !== "cancelled" && b.status !== "completed")
      .filter((b) => filterTrainer === "all" || b.trainer_id === filterTrainer)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [bookings, today, filterTrainer]);

  const paymentHistory = useMemo(() => {
    return bookings
      .filter((b) => b.trainer_paid)
      .filter((b) => filterTrainer === "all" || b.trainer_id === filterTrainer)
      .sort((a, b) => (b.trainer_paid_date || "").localeCompare(a.trainer_paid_date || ""));
  }, [bookings, filterTrainer]);

  const markPaid = async (bookingId) => {
    setPaying(bookingId);
    try {
      await base44.functions.invoke("MarkBookingTrainerPaid", { booking_id: bookingId });
      setBookings((prev) => prev.map((b) =>
        b.id === bookingId ? { ...b, trainer_paid: true, trainer_paid_date: today } : b
      ));
    } catch {}
    setPaying(null);
  };

  const markAllPaid = async (trainerId) => {
    const ids = unpaidCompleted.filter((b) => b.trainer_id === trainerId).map((b) => b.id);
    if (!ids.length) return;
    setPaying(`bulk-${trainerId}`);
    try {
      await base44.functions.invoke("MarkBookingTrainerPaid", { booking_ids: ids });
      setBookings((prev) => prev.map((b) =>
        ids.includes(b.id) ? { ...b, trainer_paid: true, trainer_paid_date: today } : b
      ));
    } catch {}
    setPaying(null);
  };

  const monthOptions = useMemo(() => {
    const set = new Set();
    bookings.forEach((b) => { if (b.date) set.add(b.date.slice(0, 7)); });
    return Array.from(set).sort().reverse();
  }, [bookings]);

  const exportPDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const pw = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("SR FITS — Trainer Payment Audit", pw / 2, y, { align: "center" });
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${now.toLocaleString("en-ZA")}`, pw / 2, y, { align: "center" });
    if (filterMonth !== "all") {
      const [yr, mo] = filterMonth.split("-");
      y += 5;
      doc.text(`Period: ${MONTHS[Number(mo) - 1]} ${yr}`, pw / 2, y, { align: "center" });
    }
    y += 8;

    doc.setDrawColor(200, 168, 77);
    doc.roundedRect(14, y, pw - 28, 24, 3, 3);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SUMMARY", 20, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Today: R ${stats.todayRevenue.toFixed(2)}`, 20, y + 14);
    doc.text(`This Month: R ${stats.monthRevenue.toFixed(2)}`, 20, y + 20);
    doc.text(`Unpaid: R ${stats.totalUnpaid.toFixed(2)}`, pw / 2, y + 14);
    doc.text(`Paid Out: R ${stats.totalPaid.toFixed(2)}`, pw / 2, y + 20);
    y += 30;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TRAINER PAYMENT AUDIT", 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Trainer", 16, y);
    doc.text("Total", 80, y);
    doc.text("Paid", 105, y);
    doc.text("Unpaid", 130, y);
    doc.text("Sessions", 160, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.line(14, y, pw - 14, y);
    y += 5;

    trainerAudit.forEach((t) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(t.trainer_name.substring(0, 28), 16, y);
      doc.text(`R${t.total.toFixed(0)}`, 80, y);
      doc.text(`R${t.paid.toFixed(0)}`, 105, y);
      doc.text(`R${t.unpaid.toFixed(0)}`, 130, y);
      doc.text(String(t.sessions.length), 160, y);
      y += 5;
    });

    y += 6;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("UNPAID COMPLETED SESSIONS", 14, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    unpaidCompleted.forEach((b) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(`${b.date} — ${b.trainer_name} — ${b.member_name} — R${b.price} — ${b.session_type}`, 16, y);
      y += 5;
    });

    doc.save(`SR_FITS_Trainer_Audit_${today}.pdf`);
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const fmtMoney = (n) => `R${n.toFixed(0)}`;
  const badge = (s) => (s === "confirmed" ? "bg-primary/15 text-primary border-primary/40" : s === "cancelled" ? "bg-destructive/15 text-destructive border-destructive/40" : s === "completed" ? "bg-white/5 text-muted-foreground border-white/10" : "bg-accent/15 text-accent border-accent/40");

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-primary/20 bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center"><Calendar className="w-3.5 h-3.5 text-primary" /></div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Today</p>
          </div>
          <p className="font-display text-lg text-primary">{fmtMoney(stats.todayRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center"><TrendingUp className="w-3.5 h-3.5 text-primary" /></div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">This Month</p>
          </div>
          <p className="font-display text-lg text-primary">{fmtMoney(stats.monthRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-accent/20 bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center"><Wallet className="w-3.5 h-3.5 text-accent" /></div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Unpaid to Trainers</p>
          </div>
          <p className="font-display text-lg text-accent">{fmtMoney(stats.totalUnpaid)}</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /></div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Paid Out</p>
          </div>
          <p className="font-display text-lg text-primary">{fmtMoney(stats.totalPaid)}</p>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={exportPDF} className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide">
          <FileDown className="w-3.5 h-3.5" /> Audit PDF
        </button>
        <select value={filterTrainer} onChange={(e) => setFilterTrainer(e.target.value)} className="rounded-lg bg-card border border-primary/20 px-3 py-2 text-xs outline-none focus:border-primary">
          <option value="all">All Trainers</option>
          {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="rounded-lg bg-card border border-primary/20 px-3 py-2 text-xs outline-none focus:border-primary">
          <option value="all">All Months</option>
          {monthOptions.map((m) => {
            const [yr, mo] = m.split("-");
            return <option key={m} value={m}>{MONTHS[Number(mo) - 1]} {yr}</option>;
          })}
        </select>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        {[
          { id: "audit", label: "Audit" },
          { id: "unpaid", label: `Unpaid (${unpaidCompleted.length})` },
          { id: "upcoming", label: `Calendar (${upcoming.length})` },
          { id: "history", label: "History" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${view === v.id ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-primary/20 text-muted-foreground"}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* AUDIT VIEW: per-trainer breakdown */}
      {view === "audit" && (
        <div className="space-y-3">
          {trainerAudit.length === 0 ? (
            <div className="rounded-2xl border border-primary/15 bg-white/[0.02] p-6 text-center">
              <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No completed sessions yet.</p>
            </div>
          ) : (
            trainerAudit
              .filter((t) => filterTrainer === "all" || t.trainer_id === filterTrainer)
              .map((t) => (
                <div key={t.trainer_id} className="rounded-2xl border border-primary/15 bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-sm">{t.trainer_name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.sessions.length} completed session(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-sm text-primary">Total: R{t.total.toFixed(0)}</p>
                      <p className="text-[10px] text-accent">Unpaid: R{t.unpaid.toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="rounded-lg bg-white/[0.03] py-2">
                      <p className="text-[9px] uppercase text-muted-foreground">Earned</p>
                      <p className="text-sm font-semibold text-primary">R{t.total.toFixed(0)}</p>
                    </div>
                    <div className="rounded-lg bg-primary/10 py-2">
                      <p className="text-[9px] uppercase text-muted-foreground">Paid</p>
                      <p className="text-sm font-semibold text-primary">R{t.paid.toFixed(0)}</p>
                    </div>
                    <div className="rounded-lg bg-accent/10 py-2">
                      <p className="text-[9px] uppercase text-muted-foreground">Owed</p>
                      <p className="text-sm font-semibold text-accent">R{t.unpaid.toFixed(0)}</p>
                    </div>
                  </div>
                  {t.unpaidCount > 0 && (
                    <button
                      onClick={() => markAllPaid(t.trainer_id)}
                      disabled={paying === `bulk-${t.trainer_id}`}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-60"
                    >
                      {paying === `bulk-${t.trainer_id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />}
                      Mark {t.unpaidCount} session(s) as Paid (R{t.unpaid.toFixed(0)})
                    </button>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {/* UNPAID VIEW: completed sessions awaiting trainer payment */}
      {view === "unpaid" && (
        <div className="space-y-2">
          {unpaidCompleted.length === 0 ? (
            <div className="rounded-2xl border border-primary/15 bg-white/[0.02] p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">All completed sessions have been paid out.</p>
            </div>
          ) : (
            unpaidCompleted.map((b) => (
              <div key={b.id} className="rounded-xl border border-accent/30 bg-accent/5 p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{b.trainer_name}</p>
                    <p className="text-[11px] text-muted-foreground">{b.member_name} · {b.date} · {b.time}</p>
                    <p className="text-[11px] text-muted-foreground">{b.session_type}</p>
                  </div>
                  <p className="font-display text-sm text-accent whitespace-nowrap">R{b.price}</p>
                </div>
                <button
                  onClick={() => markPaid(b.id)}
                  disabled={paying === b.id}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-60"
                >
                  {paying === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />} Mark Paid to Trainer
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* CALENDAR VIEW: upcoming bookings */}
      {view === "upcoming" && (
        <div className="space-y-2">
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-primary/15 bg-white/[0.02] p-6 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
            </div>
          ) : (
            upcoming.map((b) => (
              <div key={b.id} className="rounded-xl border border-primary/15 bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{b.member_name}</p>
                    <p className="text-[10px] text-primary/80 font-medium">{b.trainer_name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1"><Calendar className="w-3 h-3" />{b.date} · <Clock className="w-3 h-3" />{b.time}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">{b.session_type === "Two-Person" ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />} {b.session_type} · R{b.price}</p>
                    {b.member_phone && <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" /> {b.member_phone}</p>}
                    {b.notes && <p className="text-[10px] text-muted-foreground mt-1 italic flex items-start gap-1"><NotebookPen className="w-3 h-3 mt-0.5 shrink-0" /> "{b.notes}"</p>}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full border whitespace-nowrap ${badge(b.status)}`}>{b.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* HISTORY VIEW: sessions already paid to trainers */}
      {view === "history" && (
        <div className="space-y-2">
          {paymentHistory.length === 0 ? (
            <div className="rounded-2xl border border-primary/15 bg-white/[0.02] p-6 text-center">
              <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No trainer payments recorded yet.</p>
            </div>
          ) : (
            paymentHistory.map((b) => (
              <div key={b.id} className="rounded-xl border border-primary/15 bg-card p-3 opacity-80">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{b.trainer_name}</p>
                    <p className="text-[11px] text-muted-foreground">{b.member_name} · {b.date}</p>
                    <p className="text-[10px] text-primary flex items-center gap-1 mt-0.5"><CheckCircle2 className="w-3 h-3" /> Paid {b.trainer_paid_date}</p>
                  </div>
                  <p className="font-display text-sm text-primary whitespace-nowrap">R{b.price}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}