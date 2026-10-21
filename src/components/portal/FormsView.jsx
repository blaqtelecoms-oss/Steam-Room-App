import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, ShieldCheck, HeartPulse, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import AgreementForm from "@/components/portal/AgreementForm";

const FORMS = [
  { type: "terms", icon: FileText, title: "Terms of Agreement", blurb: "Membership terms, fees & cancellation." },
  { type: "members_agreement", icon: ShieldCheck, title: "Members Agreement", blurb: "Gym rules & code of conduct." },
  { type: "physical_readiness", icon: HeartPulse, title: "Physical Readiness", blurb: "PAR-Q health screening." },
];

export default function FormsView({ member }) {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openType, setOpenType] = useState(null);

  const load = async () => {
    const res = await base44.functions.invoke("GetMemberPortalData", { member_id: member.id });
    setAgreements(res.data?.agreements || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [member.id]);

  const byType = (t) => agreements.find((a) => a.type === t);
  const signedCount = FORMS.filter((f) => byType(f.type)).length;

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const open = openType ? byType(openType) : null;

  return (
    <div className="space-y-4 lg:max-w-3xl">
      <div className="rounded-2xl border border-primary/20 bg-card p-4">
        <p className="font-display text-[10px] tracking-widest text-primary">FORMS & AGREEMENTS</p>
        <p className="text-xs text-muted-foreground mt-1">{signedCount} of {FORMS.length} completed. Please sign each form to activate your full membership.</p>
      </div>

      {FORMS.map((f) => {
        const rec = byType(f.type);
        const Icon = f.icon;
        return (
          <button key={f.type} onClick={() => setOpenType(f.type)} className="w-full text-left rounded-2xl border border-primary/15 bg-card p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{f.title}</p>
              <p className="text-[11px] text-muted-foreground">{f.blurb}</p>
              {rec ? (
                <p className="text-[10px] text-primary mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Signed {rec.signed_date} · {rec.signature}</p>
              ) : (
                <p className="text-[10px] text-accent mt-1">Not signed — tap to complete</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        );
      })}

      {openType && (
        <AgreementForm
          type={openType}
          member={member}
          existing={open}
          onClose={() => setOpenType(null)}
          onSaved={() => { setOpenType(null); load(); }}
        />
      )}
    </div>
  );
}