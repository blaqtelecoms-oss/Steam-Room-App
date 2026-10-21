import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Send, FileDown, TrendingUp, AlertCircle, Wallet, Clock, CheckCircle2,
} from "lucide-react";
import { buildFinancePdf } from "@/lib/financePdf";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function FinanceTab() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sending, setSending] = useState(null);

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

  const memberById = useMemo(() => {
    const map = {};
    members.forEach((m) => { map[m.id] = m; });
    return map;
  }, [members]);

  const memberName = (p) => memberById[p.member_id]?.full_name || p.description || "Unknown";
  const memberPhone = (p) => (memberById[p.member_id]?.phone || "").replace(/[^0-9]/g, "");

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterMonth !== "all") {
        const d = p.date || p.due_date || p.created_date;
        if (!d) return false;
        const dt = new Date(d);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        if (key !== filterMonth) return false;
      }
      return true;
    });
  }, [payments, filterMonth, filterStatus]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const collected = payments.filter((p) => p.status === "paid").reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const outstanding = payments.filter((p) => p.status !== "paid").reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const overdue = payments.filter((p) => p.status === "overdue");
    const overdueMemberIds = new Set(overdue.map((p) => p.member_id).filter(Boolean));
    const monthCollected = payments
      .filter((p) => {
        if (p.status !== "paid") return false;
        const d = p.date || p.created_date;
        if (!d) return false;
        const dt = new Date(d);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}` === thisMonthKey;
      })
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return { collected, outstanding, overdueCount: overdueMemberIds.size, monthCollected };
  }, [payments]);

  const overduePayments = useMemo(() => payments.filter((p) => p.status === "overdue"), [payments]);

  const overdueMembers = useMemo(() => {
    const map = {};
    overduePayments.forEach((p) => {
      const key = p.member_id || "__none__";
      if (!map[key]) {
        map[key] = {
          member_id: p.member_id,
          name: memberById[p.member_id]?.full_name || p.description || "Unknown",
          phone: (memberById[p.member_id]?.phone || "").replace(/[^0-9]/g, ""),
          total: 0,
          count: 0,
        };
      }
      map[key].total += Number(p.amount) || 0;
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [overduePayments, memberById]);

  const memberReminderLink = (om) => {
    if (!om.phone) return null;
    const text = encodeURIComponent(
      `Hi ${om.name}, this is a reminder from SR FITS. You have ${om.count} overdue payment(s) totalling R${om.total}. Please settle to keep your membership active. Thank you!`
    );
    return `https://wa.me/${om.phone}?text=${text}`;
  };

  const reminderLink = (p) => {
    const phone = memberPhone(p);
    if (!phone) return null;
    const name = memberName(p);
    const text = encodeURIComponent(
      `Hi ${name}, this is a reminder from SR FITS. Your payment of R${p.amount} (${p.description || "membership"}) is OVERDUE. Please settle to keep your membership active. Thank you!`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const sendReminder = (p) => {
    const link = reminderLink(p);
    if (link) window.open(link, "_blank");
  };

  const monthOptions = useMemo(() => {
    const set = new Set();
    payments.forEach((p) => {
      const d = p.date || p.due_date || p.created_date;
      if (d) {
        const dt = new Date(d);
        set.add(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`);
      }
    });
    return Array.from(set).sort().reverse();
  }, [payments]);

  const generatePDF = () => {
   try {
    const now = new Date();
    let periodLabel = "All months";
    if (filterMonth !== "all") {
      const [yr, mo] = filterMonth.split("-");
      periodLabel = `${MONTHS[Number(mo) - 1]} ${yr}`;
    }
    const doc = buildFinancePdf({
      stats,
      overdueMembers: overdueMembers.map((om) => ({ ...om, card_id: memberById[om.member_id]?.card_id })),
      filtered,
      getName: memberName,
      getCard: (p) => memberById[p.member_id]?.card_id,
      getPhone: (p) => memberById[p.member_id]?.phone,
      periodLabel,
      statusLabel: filterStatus === "all" ? "All" : filterStatus,
    });
    const fname = filterMonth !== "all"
      ? `SR_FITS_Finance_${filterMonth}.pdf`
      : `SR_FITS_Finance_Report_${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(fname);
   } catch (e) {
    alert("Could not generate PDF: " + (e?.message || e));
   }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const fmtMoney = (n) => `R${n.toFixed(0)}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-primary/20 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Collected</p>
          </div>
          <p className="font-display text-xl text-primary">{fmtMoney(stats.collected)}</p>
        </div>
        <div className="rounded-2xl border border-accent/20 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Outstanding</p>
          </div>
          <p className="font-display text-xl text-accent">{fmtMoney(stats.outstanding)}</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">This Month</p>
          </div>
          <p className="font-display text-xl text-primary">{fmtMoney(stats.monthCollected)}</p>
        </div>
        <div className="rounded-2xl border border-destructive/20 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Overdue</p>
          </div>
          <p className="font-display text-xl text-destructive">{stats.overdueCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={generatePDF} className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide">
          <FileDown className="w-3.5 h-3.5" /> PDF Report
        </button>
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[150px] h-9 text-xs rounded-lg border-primary/20 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {monthOptions.map((m) => {
              const [yr, mo] = m.split("-");
              return <SelectItem key={m} value={m}>{MONTHS[Number(mo) - 1]} {yr}</SelectItem>;
            })}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] h-9 text-xs rounded-lg border-primary/20 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {overduePayments.length > 0 && filterStatus !== "paid" && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="font-semibold text-sm text-destructive">Overdue Members ({overdueMembers.length})</p>
          </div>
          <div className="space-y-2">
            {overdueMembers.map((om) => {
              const link = memberReminderLink(om);
              return (
                <div key={om.member_id || om.name} className="flex items-center justify-between gap-3 rounded-lg bg-card/50 border border-destructive/20 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{om.name}</p>
                    <p className="text-[11px] text-muted-foreground">{om.count} unpaid · R{om.total}</p>
                  </div>
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-primary/30 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/10 whitespace-nowrap"
                    >
                      <Send className="w-3 h-3" /> Remind
                    </a>
                  ) : (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">No phone</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-display text-sm tracking-wide text-primary">ALL PAYMENTS ({filtered.length})</p>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-primary/15 bg-white/[0.02] p-6 text-center">
            <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No payments match this filter.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => {
              const link = reminderLink(p);
              const tone = p.status === "paid" ? "bg-primary/15 text-primary" : p.status === "overdue" ? "bg-destructive/15 text-destructive" : "bg-yellow-500/15 text-yellow-400";
              return (
                <div key={p.id} className="rounded-xl border border-primary/15 bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{memberName(p)}</p>
                      <p className="text-[11px] text-muted-foreground">{p.description || "Membership"} · {p.date || p.due_date || "—"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-sm text-primary">R{p.amount}</p>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ${tone}`}>{p.status}</span>
                    </div>
                  </div>
                  {p.status !== "paid" && link && (
                    <button
                      onClick={() => sendReminder(p)}
                      className="mt-2 flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-1.5 hover:bg-primary/10"
                    >
                      <Send className="w-3 h-3 text-primary" /> Send WhatsApp Reminder
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}