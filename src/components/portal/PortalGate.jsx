import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Lock, ArrowRight, Loader2, Mail, Shield, Dumbbell, Briefcase } from "lucide-react";

export default function PortalGate({ onUnlock, onRegister }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    // Admin override: redirect to admin console
    if (code.trim().toLowerCase() === "admin2026") {
      navigate("/admin");
      return;
    }
    setChecking(true);
    setErr("");
    try {
      const res = await base44.functions.invoke("LoginWithSRNumber", { srNumber: code });
      onUnlock(res.data.member);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Could not log in. Please try again.");
      setChecking(false);
    }
  };

  const forgot = async () => {
    setSending(true);
    setErr("");
    setSent("");
    try {
      const res = await base44.functions.invoke("SendSRReminder", {});
      setSent(`Your SR number has been emailed to ${res.data.email}.`);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Could not send reminder.");
    }
    setSending(false);
  };

  return (
    <div className="pt-24 px-4 min-h-screen flex flex-col items-center lg:pt-36">
      <div className="w-full max-w-sm lg:max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <p className="font-display text-[10px] tracking-widest text-primary">SR FITS</p>
          <h1 className="font-space font-bold text-2xl mt-1">Member Portal</h1>
          <p className="text-xs text-muted-foreground mt-2">Enter your SR number (your membership number) to access your portal.</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-primary/20 bg-white/[0.02] p-4 space-y-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">SR Number</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SR0000148DC"
              autoFocus
              className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary tracking-wide"
            />
          </label>
          {err && <p className="text-xs text-destructive">{err}</p>}
          {sent && <p className="text-xs text-primary">{sent}</p>}
          <button type="submit" disabled={checking || !code.trim()} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60">
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> Unlock</>}
          </button>
          <button type="button" onClick={forgot} disabled={sending} className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-60">
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />} Forgot SR number?
          </button>
        </form>
        <p className="text-[11px] text-muted-foreground text-center mt-4">
          Don't have an SR number?{" "}
          <button type="button" onClick={onRegister} className="text-primary hover:underline">Register here</button>
        </p>
        <div className="mt-6 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => navigate("/trainer-portal")}
            className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <Dumbbell className="w-3 h-3" /> Trainer Bookings
          </button>
          <span className="w-px h-3 bg-white/10" />
          <button
            type="button"
            onClick={() => navigate("/employee-portal")}
            className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <Briefcase className="w-3 h-3" /> Employee Portal
          </button>
          <span className="w-px h-3 bg-white/10" />
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <Shield className="w-3 h-3" /> Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}