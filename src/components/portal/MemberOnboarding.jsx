import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus, ArrowRight } from "lucide-react";
import MandateStep from "@/components/portal/MandateStep";
import MandateFormFields, { EMPTY_MANDATE } from "@/components/shared/MandateFormFields";

const tiers = ["Starter", "Pro", "Elite"];

export default function MemberOnboarding({ onCreated }) {
  const [form, setForm] = useState({
    full_name: "",
    date_joined: new Date().toISOString().slice(0, 10),
    membership_tier: "Pro",
    ...EMPTY_MANDATE,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("profile");

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await base44.functions.invoke("RegisterMember", form);
      onCreated(res.data.member);
    } catch (err) {
      setError(err?.message || "Activation failed. Please try again.");
      setStep("profile");
    } finally {
      setSaving(false);
    }
  };

  if (step === "mandate") {
    return (
      <div className="pt-24 px-4 min-h-screen lg:pt-8 lg:max-w-3xl lg:mx-auto">
        <MandateStep form={form} onBack={() => setStep("profile")} onConfirm={submit} saving={saving} />
        {error && <p className="text-xs text-destructive mt-3 text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 min-h-screen pb-10 lg:pt-8 lg:max-w-3xl lg:mx-auto">
      <div className="rounded-2xl border border-primary/20 bg-white/[0.03] p-6">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus className="w-5 h-5 text-primary" />
          <h2 className="font-display text-base tracking-wide">Activate membership</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Complete your profile and debit-mandate details once. Your information is saved and reused — no need to fill it in again.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.full_name) return;
            setStep("mandate");
          }}
          className="space-y-5"
        >
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-primary/10 pb-1">Member profile</p>
            <input value={form.full_name} onChange={(e) => upd("full_name", e.target.value)} placeholder="Full name" required className="w-full rounded-xl bg-background border border-primary/20 px-3 py-2.5 text-sm" />
            <input type="date" value={form.date_joined} onChange={(e) => upd("date_joined", e.target.value)} className="w-full rounded-xl bg-background border border-primary/20 px-3 py-2.5 text-sm" />
            <div className="grid grid-cols-3 gap-2">
              {tiers.map((t) => (
                <button type="button" key={t} onClick={() => upd("membership_tier", t)} className={`rounded-xl py-2 text-xs font-semibold uppercase tracking-wide border ${form.membership_tier === t ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-primary/20 text-muted-foreground"}`}>{t}</button>
              ))}
            </div>
          </div>

          <MandateFormFields form={form} upd={upd} />

          {error && <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide flex items-center justify-center gap-2">
            Continue to mandate <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}