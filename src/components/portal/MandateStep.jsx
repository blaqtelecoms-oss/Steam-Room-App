import React, { useState } from "react";
import { ExternalLink, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

const MANDATE_URL = "https://www.electronicmandate.com/srfits/";

export default function MandateStep({ form, onBack, onConfirm, saving }) {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please complete the mandate and confirm to continue.");
      return;
    }
    setError("");
    onConfirm();
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-white/[0.03] p-6">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h2 className="font-display text-base tracking-wide">Electronic debit mandate</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Complete the official debit-order agreement to authorize membership payments, then confirm below to activate.
      </p>

      <a
        href={MANDATE_URL}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 mb-4 hover:bg-primary/15 transition-colors"
      >
        <div>
          <p className="text-sm font-semibold text-primary">Open mandate form</p>
          <p className="text-[11px] text-muted-foreground">Opens in a new tab — electronicmandate.com</p>
        </div>
        <ExternalLink className="w-4 h-4 text-primary" />
      </a>

      <div className="rounded-xl border border-primary/15 bg-background px-4 py-3 mb-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          You'll be asked for your membership type, ID, banking details, and next of kin. The mandate authorizes Steam Room Fitness Centre to collect monthly dues via DebiCheck.
        </p>
      </div>

      <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-primary/40 accent-[hsl(var(--primary))]"
        />
        <span className="text-xs text-foreground/90 leading-relaxed">
          I have completed the electronic debit mandate and agree to the membership terms & debit-order authorization.
        </span>
      </label>

      {error && <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 mb-3">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl border border-primary/20 px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-primary/5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="flex-1 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {saving ? "Activating…" : "Activate membership"}
        </button>
      </div>
    </div>
  );
}