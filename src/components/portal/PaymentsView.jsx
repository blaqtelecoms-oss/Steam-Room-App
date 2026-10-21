import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { startYocoCheckout } from "@/lib/yoco";
import { CheckCircle2, CreditCard, Loader2, AlertTriangle } from "lucide-react";

export default function PaymentsView({ member }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    const res = await base44.functions.invoke("GetMemberPortalData", { member_id: member.id });
    setPayments(res.data?.payments || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const outstanding = payments.filter((p) => p.status !== "paid");
  const overdue = payments.filter((p) => p.status === "overdue");
  const paid = payments.filter((p) => p.status === "paid");

  const pay = async (p) => {
    setPayingId(p.id);
    setError("");
    try {
      await startYocoCheckout({
        amount: p.amount,
        type: p.type || "membership",
        description: p.description || "Membership",
        payment_id: p.id,
        member_id: member.id,
        onSuccess: () => {},
        onError: (e) => { setError(e?.message || "Payment failed."); setPayingId(null); },
        onClose: () => setPayingId(null),
      });
    } catch (e) {
      setError(e?.message || "Could not start checkout. Please try again.");
      setPayingId(null);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground text-sm">Loading payments…</div>;

  return (
    <div className="space-y-5">
      {overdue.length > 0 && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-destructive">Unpaid account warning</p>
            <p className="text-xs text-muted-foreground mt-0.5">You have {overdue.length} unpaid debit(s) totalling R{overdue.reduce((s, p) => s + (Number(p.amount) || 0), 0).toFixed(0)}. Settle below to keep your membership active and avoid suspension.</p>
          </div>
        </div>
      )}
      {outstanding.length > 0 && (
        <div>
          <h3 className="font-display text-sm tracking-wide mb-3 text-accent">STATEMENTS DUE</h3>
          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
            {outstanding.map((p) => (
              <div key={p.id} className="rounded-2xl border border-accent/40 bg-accent/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{p.description || "Membership"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Due {p.due_date ? new Date(p.due_date).toLocaleDateString("en-ZA") : "—"}</p>
                    {p.invoice_no && <p className="text-[10px] font-mono text-muted-foreground mt-1">INV {p.invoice_no}</p>}
                  </div>
                  <p className="font-display text-lg text-accent">R{p.amount}</p>
                </div>
                <button onClick={() => pay(p)} disabled={payingId === p.id} className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-60">
                  {payingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />} Pay now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-destructive text-center">{error}</p>}
      <div>
        <h3 className="font-display text-sm tracking-wide mb-3">PAYMENT HISTORY</h3>
        {paid.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No payments yet.</p>
        ) : (
          <div className="space-y-2 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-2">
            {paid.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-primary/15 bg-white/[0.03] p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{p.description || "Membership"}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(p.date).toLocaleDateString("en-ZA")} · {p.method || "—"}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-primary">R{p.amount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}