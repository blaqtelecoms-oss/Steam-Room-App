import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Loader2, Shield, LogOut, Dumbbell } from "lucide-react";
import TrainerAuditDashboard from "@/components/admin/TrainerAuditDashboard";

const ADMIN_PASSWORD = "Admin2026";
const SESSION_KEY = "srfits_trainer_admin";

export default function TrainerPortal() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  const unlock = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    } else {
      setErr(true);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setPw("");
  };

  if (!authed) {
    return (
      <div className="pt-20 px-4 pb-10 min-h-screen flex flex-col items-center lg:pt-36">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <p className="font-display text-[10px] tracking-widest text-primary">SR FITS</p>
            <h1 className="font-space font-bold text-2xl mt-1">Trainer Management</h1>
            <p className="text-xs text-muted-foreground mt-2">Admin access only. Enter the admin password to manage trainer bookings and payments.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); unlock(); }} className="rounded-2xl border border-primary/20 bg-white/[0.02] p-4 space-y-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Admin Password</span>
              <input
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setErr(false); }}
                placeholder="Enter admin password"
                autoFocus
                className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2.5 text-sm outline-none focus:border-primary tracking-wide"
              />
            </label>
            {err && <p className="text-xs text-destructive">Incorrect password.</p>}
            <button type="submit" disabled={!pw.trim()} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60">
              <ArrowRight className="w-4 h-4" /> Unlock
            </button>
          </form>
          <button type="button" onClick={() => navigate("/portal")} className="mt-6 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors w-full">
            <Lock className="w-3 h-3" /> Back to Member Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 px-4 pb-10 min-h-screen lg:pt-24 lg:px-8 lg:max-w-7xl lg:mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-display text-[10px] tracking-widest text-primary">ADMIN MODE</p>
            <h1 className="font-space font-bold text-lg leading-tight">Trainer Management</h1>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-primary/20 rounded-lg px-3 py-2">
          <LogOut className="w-3.5 h-3.5" /> Lock
        </button>
      </div>
      <TrainerAuditDashboard />
    </div>
  );
}