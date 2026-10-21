import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Save, Loader2, CheckCircle2, ShieldCheck, FileText, HeartPulse, X } from "lucide-react";

const TODAY = new Date().toISOString().slice(0, 10);

const META = {
  terms: {
    icon: FileText,
    title: "Terms of Agreement",
    blurb: "Membership terms, fees & cancellation policy.",
  },
  members_agreement: {
    icon: ShieldCheck,
    title: "Members Agreement",
    blurb: "Gym rules & code of conduct.",
  },
  physical_readiness: {
    icon: HeartPulse,
    title: "Physical Readiness Questionnaire",
    blurb: "PAR-Q health screening before training.",
  },
};

const PARQ_QUESTIONS = [
  "Has your doctor ever said you have heart trouble and that you should only do physical activity recommended by a doctor?",
  "Do you frequently have pains in your chest when you perform physical activity?",
  "Do you feel pain in your chest when you are not doing physical activity?",
  "Do you lose your balance because of dizziness, or do you ever lose consciousness?",
  "Do you have a bone, joint or any other health problem that could be made worse by a change in physical activity?",
  "Is your doctor currently prescribing drugs for your blood pressure or a heart condition?",
  "Do you know of any other reason why you should not perform physical activity?",
];

export default function AgreementForm({ type, member, existing, onClose, onSaved }) {
  const meta = META[type];
  const Icon = meta.icon;
  const [agreed, setAgreed] = useState(existing?.agreed || false);
  const [signature, setSignature] = useState(existing?.signature || "");
  const [signedDate, setSignedDate] = useState(existing?.signed_date || TODAY);
  const [answers, setAnswers] = useState(existing?.answers || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setAns = (i, v) => setAnswers((a) => ({ ...a, [`q${i + 1}`]: v }));

  const canSign = agreed && signature.trim().length > 1 && (type !== "physical_readiness" || PARQ_QUESTIONS.every((_, i) => answers[`q${i + 1}`]));

  const save = async () => {
    if (!canSign) {
      setError("Please complete all required fields and type your full name to sign.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        member_id: member.id,
        type,
        agreed: true,
        signature: signature.trim(),
        signed_date: signedDate,
        answers: type === "physical_readiness" ? answers : null,
      };
      await base44.functions.invoke("SaveAgreement", { id: existing?.id, ...payload });
      onSaved();
    } catch (e) {
      setError(e?.message || "Save failed.");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-primary/25 bg-card p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <h3 className="font-display text-sm tracking-wide">{meta.title}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          {type === "terms" && <TermsContent />}
          {type === "members_agreement" && <MembersContent />}
          {type === "physical_readiness" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Please answer all questions honestly. If you answer <span className="text-accent">Yes</span> to any, consult your doctor before training.</p>
              {PARQ_QUESTIONS.map((q, i) => (
                <div key={i} className="rounded-lg border border-primary/15 bg-white/[0.02] p-3">
                  <p className="text-xs mb-2">{q}</p>
                  <div className="flex gap-2">
                    {["No", "Yes"].map((opt) => {
                      const val = answers[`q${i + 1}`];
                      const active = val === opt.toLowerCase();
                      return (
                        <button key={opt} type="button" onClick={() => setAns(i, opt.toLowerCase())} className={`flex-1 rounded-lg py-1.5 text-xs font-semibold uppercase border ${active ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground"}`}>{opt}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-primary/15 bg-white/[0.02] p-3 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-[hsl(var(--primary))]" />
              <span className="text-xs text-foreground/90 leading-relaxed">I have read, understood and agree to the above. I confirm the information I provide is true.</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Signature (full name)</span>
                <input value={signature} onChange={(e) => setSignature(e.target.value)} className="mt-1 w-full rounded-lg bg-background border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Date</span>
                <input type="date" value={signedDate} onChange={(e) => setSignedDate(e.target.value)} className="mt-1 w-full rounded-lg bg-background border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>
            </div>
          </div>

          {error && <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</p>}

          <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Sign & submit
          </button>
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="rounded-lg border border-primary/15 bg-white/[0.02] p-3 max-h-56 overflow-y-auto text-[11px] leading-relaxed text-muted-foreground space-y-2">
      <p>1. <span className="text-foreground">Membership & Fees.</span> Monthly premiums are debited via DebiCheck on your selected debit day. A once-off joining fee applies. Fees are non-refundable once training has commenced.</p>
      <p>2. <span className="text-foreground">Contract.</span> Your contract length and monthly premium are as per the package selected. The contract auto-renews on a month-to-month basis after the fixed term unless cancelled in writing with 30 days' notice.</p>
      <p>3. <span className="text-foreground">Cancellation.</span> Cancellation must be submitted in writing (email or at reception) at least 30 days before the next debit date. Early cancellation of a fixed-term contract remains payable for the outstanding term.</p>
      <p>4. <span className="text-foreground">Freeze.</span> Memberships may be frozen for medical or travel reasons for up to 3 months per year, on request with supporting evidence.</p>
      <p>5. <span className="text-foreground">Access.</span> Membership access is non-transferable. Your card/access tag is for your personal use only.</p>
      <p>6. <span className="text-foreground">Liability.</span> Steam Room Fitness Centre is not liable for personal injury or loss of property on the premises. Members train at their own risk and must follow staff instructions.</p>
    </div>
  );
}

function MembersContent() {
  const rules = [
    "Always carry a sweat towel and wipe down equipment after use.",
    "Return weights, plates and accessories to their designated place after training.",
    "No bags on the gym floor — use the lockers provided.",
    "Appropriate training attire and closed shoes must be worn at all times.",
    "No food on the gym floor; water in sealed bottles only.",
    "Respect other members and staff — no offensive language or harassment.",
    "Follow staff instructions and report any equipment faults or injuries immediately.",
    "Members under 18 must be accompanied or have parental consent on file.",
  ];
  return (
    <div className="rounded-lg border border-primary/15 bg-white/[0.02] p-3 max-h-56 overflow-y-auto text-[11px] leading-relaxed text-muted-foreground space-y-1.5">
      <p className="text-foreground font-semibold mb-1">Code of Conduct</p>
      {rules.map((r, i) => (
        <p key={i}>{i + 1}. {r}</p>
      ))}
    </div>
  );
}