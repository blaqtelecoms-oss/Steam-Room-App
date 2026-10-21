import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import MemberCard from "./MemberCard";
import { AlertCircle, TrendingUp, Dumbbell, Wallet } from "lucide-react";

export default function DashboardView({ member, onTab }) {
  const [payments, setPayments] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    (async () => {
      const portalRes = await base44.functions.invoke("GetMemberPortalData", { member_id: member.id });
      setPayments(portalRes.data?.payments || []);
      setProgress(portalRes.data?.progress || []);
    })();
  }, [member?.id]);

  const outstanding = payments.filter((p) => p.status !== "paid");
  const overdue = payments.filter((p) => p.status === "overdue");
  const latest = progress[0];

  const creditLimit = Number(member?.credit_limit ?? 500);
  const creditBalance = payments
    .filter((p) => p.type === "credit" && p.status !== "paid")
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const available = Math.max(0, creditLimit - creditBalance);
  const limitPct = Math.min(100, (creditBalance / creditLimit) * 100);

  const stats = [
    { label: "Outstanding", value: outstanding.length, sub: "statements", icon: AlertCircle, tone: outstanding.length ? "text-accent" : "text-primary", onClick: () => onTab("payments") },
    { label: "Workouts", value: progress.length, sub: "logged", icon: Dumbbell, tone: "text-primary", onClick: () => onTab("program") },
  ];

  return (
    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
      <MemberCard member={member} />

      {/* Credit facility */}
      <div className="rounded-2xl border border-primary/25 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-primary" />
          <p className="font-semibold text-sm">Store Credit</p>
          <span className="ml-auto text-[10px] text-muted-foreground uppercase tracking-wide">merchandise</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Limit</p>
            <p className="font-bold text-base text-primary">R{creditLimit.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Owed</p>
            <p className={`font-bold text-base ${creditBalance > 0 ? "text-accent" : "text-foreground"}`}>R{creditBalance.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Available</p>
            <p className="font-bold text-base text-primary">R{available.toFixed(0)}</p>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${limitPct}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Pay memberships on time to grow your limit up to R2000.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <button key={s.label} onClick={s.onClick} className="text-left rounded-2xl border border-primary/15 bg-white/[0.03] p-4 hover:border-primary/40 transition-colors">
            <s.icon className={`w-5 h-5 ${s.tone} mb-2`} />
            <p className="font-display text-2xl">{s.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          </button>
        ))}
      </div>
      {overdue.length > 0 && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="font-semibold text-sm text-destructive">Account warning — unpaid debit</p>
          </div>
          <p className="text-xs text-muted-foreground">You have {overdue.length} unpaid debit(s) totalling R{overdue.reduce((s, p) => s + (Number(p.amount) || 0), 0).toFixed(0)}. Your membership may be affected. Please settle to avoid suspension.</p>
          <button onClick={() => onTab("payments")} className="mt-2 text-xs font-semibold text-destructive">Pay now →</button>
        </div>
      )}
      {outstanding.length > 0 && overdue.length === 0 && (
        <div className="rounded-2xl border border-accent/40 bg-accent/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-accent" />
            <p className="font-semibold text-sm">Payment due</p>
          </div>
          <p className="text-xs text-muted-foreground">You have {outstanding.length} outstanding statement(s). Tap to view and pay.</p>
          <button onClick={() => onTab("payments")} className="mt-2 text-xs font-semibold text-accent">View statements →</button>
        </div>
      )}
      {latest && (
        <div className="rounded-2xl border border-primary/15 bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="font-semibold text-sm">Latest check-in</p>
          </div>
          <p className="text-xs text-muted-foreground">{new Date(latest.date).toLocaleDateString("en-ZA")} · {latest.weight} kg</p>
          {latest.notes && <p className="text-xs text-muted-foreground mt-1">{latest.notes}</p>}
        </div>
      )}
    </div>
  );
}