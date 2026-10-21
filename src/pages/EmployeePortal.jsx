import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Loader2, ArrowRight, Briefcase, CreditCard, Wallet, Calendar, Shield, LogOut,
  Lock, CheckCircle2, AlertCircle, ShoppingBag,
} from "lucide-react";

export default function EmployeePortal() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const [empNumber, setEmpNumber] = useState("");
  const [err, setErr] = useState("");
  const [checking, setChecking] = useState(false);
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);

  const login = async (e) => {
    e.preventDefault();
    if (!empNumber.trim()) return;
    setChecking(true);
    setErr("");
    try {
      const res = await base44.functions.invoke("LoginWithEMPNumber", {
        empNumber: empNumber.trim(),
        userEmail: user?.email,
        userId: user?.id,
      });
      setData(res.data);
      // Load payments for linked member
      if (res.data?.member?.id) {
        try {
          const pays = await base44.entities.Payment.filter({ member_id: res.data.member.id }, "-date", 20);
          setPayments(pays);
        } catch {}
      }
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Could not log in.");
    }
    setChecking(false);
  };

  const logout = () => {
    setData(null);
    setEmpNumber("");
    setPayments([]);
  };

  if (isLoadingAuth) {
    return <div className="pt-20 min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-20 px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-primary/25 bg-card p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center mb-3 mx-auto">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-sm tracking-widest text-primary mb-2">EMPLOYEE PORTAL</h1>
          <p className="text-xs text-muted-foreground mb-5">Please sign in with your invited account to access the Employee Portal.</p>
          <button onClick={navigateToLogin} className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold uppercase tracking-wide flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4" /> Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pt-20 px-4 min-h-screen flex flex-col items-center lg:pt-36">
        <div className="w-full max-w-sm lg:max-w-md">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <p className="font-display text-[10px] tracking-widest text-primary">SR FITS</p>
            <h1 className="font-space font-bold text-2xl mt-1">Employee Portal</h1>
            <p className="text-xs text-muted-foreground mt-2">Signed in as {user?.email}. Enter your EMP number to access your portal.</p>
          </div>
          <form onSubmit={login} className="rounded-2xl border border-primary/20 bg-white/[0.02] p-4 space-y-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">EMP Number</span>
              <input
                value={empNumber}
                onChange={(e) => setEmpNumber(e.target.value)}
                placeholder="e.g. EMP0001"
                autoFocus
                className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary tracking-wide font-mono"
              />
            </label>
            {err && <p className="text-xs text-destructive">{err}</p>}
            <button type="submit" disabled={checking || !empNumber.trim()} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60">
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Unlock Portal</>}
            </button>
          </form>
          <p className="text-[11px] text-muted-foreground text-center mt-4">
            Don't have an EMP number? Ask management to invite you.
          </p>
        </div>
      </div>
    );
  }

  const { employee, member } = data;
  const permittedTabs = employee.permitted_tabs || [];
  const hasDuties = permittedTabs.length > 0;
  const creditBalance = Number(member?.credit_balance) || 0;
  const nextPayment = member?.next_payment_date ? new Date(member.next_payment_date) : null;
  const nextAmount = Number(member?.next_payment_amount) || 0;
  const outstanding = payments.filter((p) => p.status !== "paid").reduce((s, p) => s + (Number(p.amount) || 0), 0);

  return (
    <div className="pt-16 px-4 pb-10 min-h-screen lg:pt-24 lg:px-8 lg:max-w-3xl lg:mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-widest text-primary">{employee.emp_number}</p>
            <h1 className="font-space font-bold text-lg leading-tight">{employee.full_name || "Employee"}</h1>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-primary/20 rounded-lg px-3 py-2">
          <LogOut className="w-3.5 h-3.5" /> Exit
        </button>
      </div>

      {/* Duties Badge */}
      {hasDuties ? (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-3 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Assigned Duties</p>
            <p className="text-sm font-semibold text-accent truncate">{permittedTabs.join(", ")}</p>
          </div>
          <button onClick={() => navigate("/admin")} className="ml-auto shrink-0 flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold uppercase tracking-wide">
            <Shield className="w-3.5 h-3.5" /> Open Admin
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary/20 bg-white/[0.02] p-3 mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Portal Access</p>
            <p className="text-sm font-semibold">Personal Information Only</p>
          </div>
        </div>
      )}

      {/* Account Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl border border-primary/20 bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center"><Wallet className="w-3.5 h-3.5 text-primary" /></div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Store Credit</p>
          </div>
          <p className="font-display text-lg text-primary">R{creditBalance.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center"><CreditCard className="w-3.5 h-3.5 text-accent" /></div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Outstanding</p>
          </div>
          <p className="font-display text-lg text-accent">R{outstanding.toFixed(0)}</p>
        </div>
      </div>

      {/* Membership Status */}
      {member && (
        <div className="rounded-2xl border border-primary/20 bg-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-display text-sm tracking-wide text-primary">GYM MEMBERSHIP</p>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${member.status === "active" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
              {member.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Tier</p>
              <p className="font-semibold">{member.membership_tier}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Joined</p>
              <p className="font-semibold">{member.date_joined ? new Date(member.date_joined).toLocaleDateString("en-ZA") : "—"}</p>
            </div>
            {nextPayment && (
              <>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Next Payment</p>
                  <p className="font-semibold">{nextPayment.toLocaleDateString("en-ZA")}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground">Amount Due</p>
                  <p className="font-semibold text-primary">R{nextAmount.toFixed(0)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className="rounded-2xl border border-primary/20 bg-card p-4">
        <p className="font-display text-sm tracking-wide text-primary mb-3">RECENT PAYMENTS & CREDIT</p>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No payment history yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b border-primary/10 pb-2 last:border-0">
                <div>
                  <p className="font-medium">{p.description || p.type || "Payment"}</p>
                  <p className="text-[11px] text-muted-foreground">{p.date ? new Date(p.date).toLocaleDateString("en-ZA") : ""}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">R{Number(p.amount).toFixed(0)}</p>
                  <span className={`text-[10px] uppercase ${p.status === "paid" ? "text-primary" : p.status === "overdue" ? "text-destructive" : "text-accent"}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground text-center mt-4">
        Employee portal · {hasDuties ? `${permittedTabs.length} duties assigned` : "Personal info only"} · {employee.emp_number}
      </p>
    </div>
  );
}