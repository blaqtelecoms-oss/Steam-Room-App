import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, ShieldCheck, HeartPulse, Loader2, CheckCircle2, XCircle } from "lucide-react";

const META = {
  terms: { icon: FileText, title: "Terms of Agreement" },
  members_agreement: { icon: ShieldCheck, title: "Members Agreement" },
  physical_readiness: { icon: HeartPulse, title: "Physical Readiness" },
};
const ORDER = ["terms", "members_agreement", "physical_readiness"];

export default function AgreementsTab({ memberId, memberName }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await base44.entities.Agreement.filter({ member_id: memberId }, "-signed_date", 50);
      setItems(res || []);
      setLoading(false);
    })();
  }, [memberId]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>;

  const byType = (t) => items.find((a) => a.type === t);

  return (
    <div className="space-y-3">
      <p className="font-display text-[10px] tracking-widest text-primary">SIGNED FORMS {memberName ? `· ${memberName}` : ""}</p>
      {ORDER.map((t) => {
        const rec = byType(t);
        const meta = META[t];
        const Icon = meta.icon;
        return (
          <div key={t} className="rounded-2xl border border-primary/15 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{meta.title}</p>
                {rec ? (
                  <p className="text-[11px] text-primary flex items-center gap-1 mt-0.5"><CheckCircle2 className="w-3 h-3" /> Signed {rec.signed_date} by {rec.signature}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><XCircle className="w-3 h-3" /> Not signed</p>
                )}
              </div>
            </div>
            {rec?.type === "physical_readiness" && rec.answers && (
              <div className="mt-3 grid grid-cols-1 gap-1.5">
                {Object.entries(rec.answers).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[11px] rounded-lg bg-white/[0.02] border border-primary/10 px-2.5 py-1.5">
                    <span className="text-muted-foreground">Question {k.replace("q", "")}</span>
                    <span className={`font-semibold uppercase ${v === "yes" ? "text-accent" : "text-primary"}`}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}