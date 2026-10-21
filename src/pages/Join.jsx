import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, UserPlus, LogIn, Dumbbell, CreditCard, Trophy, ArrowRight } from "lucide-react";
import MemberOnboarding from "@/components/portal/MemberOnboarding";

const LOGO = "/media/86f059f1a_Logo.jpeg";

const benefits = [
  { icon: Dumbbell, title: "Train", text: "Group classes & personal programs." },
  { icon: CreditCard, title: "Manage", text: "Track payments & membership." },
  { icon: Trophy, title: "Compete", text: "Enter the transformation challenge." },
];

export default function Join() {
  const [authed, setAuthed] = useState(null);
  const [member, setMember] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        setAuthed(isAuthed);
        if (isAuthed) {
          const user = await base44.auth.me();
          const mems = await base44.entities.Member.filter({ created_by_id: user.id }, "-created_date", 1);
          setMember(mems[0] || null);
        }
      } catch {
        setAuthed(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (authed && member) navigate("/portal", { replace: true });
  }, [authed, member, navigate]);

  if (checking || (authed && member)) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  // Logged in, no member yet → apply to the gym
  if (authed && !member) {
    return (
      <div className="pt-20 pb-10 px-4 min-h-screen lg:pt-28 lg:px-8">
        <div className="text-center mb-5">
          <div className="inline-flex w-12 h-12 rounded-full bg-primary/10 border border-primary/40 items-center justify-center mb-3">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-sm tracking-widest text-primary">APPLY TO THE GYM</h1>
          <p className="text-xs text-muted-foreground mt-1">Your account is ready. Complete your profile to activate membership.</p>
        </div>
        <MemberOnboarding onCreated={(m) => setMember(m)} />
      </div>
    );
  }

  // Not logged in → landing / create account
  return (
    <div className="pt-16 min-h-screen px-4 lg:pt-24 lg:px-8">
      <div className="lg:max-w-5xl lg:mx-auto lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:min-h-[calc(100vh-9rem)]">
      <div className="flex flex-col items-center text-center pt-10 pb-8 lg:pt-0 lg:pb-0">
        <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/40 overflow-hidden mb-5 animate-float">
          <img src={LOGO} alt="SR FITS" className="w-full h-full object-cover" />
        </div>
        <p className="font-display text-[10px] tracking-[0.3em] text-primary">STEAM ROOM</p>
        <h1 className="font-display text-2xl lg:text-4xl tracking-wide mt-2 leading-tight">JOIN THE<br />FITNESS CENTER</h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-3 max-w-xs lg:max-w-md">
          Create your app account to access training, payments, and challenges — then apply to become a member.
        </p>
        <button
          onClick={() => base44.auth.redirectToLogin("/join")}
          className="mt-6 w-full max-w-xs lg:max-w-sm flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wide shadow-lg shadow-primary/25"
        >
          <UserPlus className="w-4 h-4" /> Create your account
        </button>
        <button
          onClick={() => base44.auth.redirectToLogin("/join")}
          className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
        >
          <LogIn className="w-3.5 h-3.5" /> Already have an account? Log in
        </button>
      </div>

      <div>
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto lg:max-w-md">
        {benefits.map((b) => (
          <div key={b.title} className="rounded-2xl border border-primary/15 bg-white/[0.03] p-3 text-center">
            <b.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs font-semibold">{b.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{b.text}</p>
          </div>
        ))}
      </div>

      <div className="max-w-xs mx-auto mt-8 lg:max-w-md rounded-2xl border border-primary/20 bg-white/[0.03] p-4">
        <p className="text-xs font-semibold mb-3 flex items-center gap-1.5 text-primary">How it works <ArrowRight className="w-3.5 h-3.5" /></p>
        <ol className="space-y-2 text-xs text-muted-foreground">
          <li><span className="text-primary font-bold">1.</span> Create your app account.</li>
          <li><span className="text-primary font-bold">2.</span> Fill in the member application.</li>
          <li><span className="text-primary font-bold">3.</span> Get your digital gym card & portal access.</li>
        </ol>
      </div>
      </div>
      </div>
    </div>
  );
}