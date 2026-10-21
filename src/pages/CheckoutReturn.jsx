import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export default function CheckoutReturn() {
  const navigate = useNavigate();
  const reference = new URLSearchParams(window.location.search).get("reference");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    if (!reference) { setLoading(false); setError("No order reference found in the return URL."); return; }
    let active = true;

    const poll = async () => {
      try {
        const res = await base44.functions.invoke("GetOrderStatus", { reference });
        if (!active) return;
        const o = res.data?.order || null;
        setOrder(o);
        setLoading(false);
        if (!o || o.status === "pending") {
          timer.current = setTimeout(poll, 3000);
        }
      } catch (e) {
        if (!active) return;
        setError(e?.message || "Could not load your order.");
        setLoading(false);
      }
    };
    poll();
    return () => { active = false; if (timer.current) clearTimeout(timer.current); };
  }, [reference]);

  return (
    <div className="pt-24 px-4 min-h-screen flex flex-col items-center lg:pt-36">
      <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-card p-6 text-center">
        {loading ? (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <h1 className="font-display text-sm tracking-wide mb-1">CONFIRMING PAYMENT</h1>
            <p className="text-xs text-muted-foreground">Please wait while we confirm your payment with the bank…</p>
          </>
        ) : error ? (
          <>
            <XCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-sm tracking-wide mb-1">SOMETHING WENT WRONG</h1>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <button onClick={() => navigate("/portal")} className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase">Back to portal</button>
          </>
        ) : order?.status === "paid" ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
            <h1 className="font-display text-sm tracking-wide mb-1">PAYMENT CONFIRMED</h1>
            <p className="text-xs text-muted-foreground mb-1">R{Number(order.amount).toFixed(2)} · {order.type}</p>
            <p className="text-[10px] font-mono text-muted-foreground mb-4">{order.reference}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => navigate("/portal")} className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase">Back to portal</button>
              {order.type === "merchandise" && <button onClick={() => navigate("/portal")} className="rounded-xl border border-primary/30 px-4 py-2 text-xs font-semibold uppercase">Continue shopping</button>}
            </div>
          </>
        ) : order?.status === "failed" ? (
          <>
            <XCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-sm tracking-wide mb-1">PAYMENT FAILED</h1>
            <p className="text-xs text-muted-foreground mb-4">Your payment could not be processed. Please try again.</p>
            <button onClick={() => navigate("/portal")} className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase">Back to portal</button>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <h1 className="font-display text-sm tracking-wide mb-1">PAYMENT SUBMITTED</h1>
            <p className="text-xs text-muted-foreground mb-3">We're awaiting confirmation from the bank. This page will update automatically.</p>
            <p className="text-[10px] font-mono text-muted-foreground">{order?.reference}</p>
          </>
        )}
      </div>
      <button onClick={() => navigate("/portal")} className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to portal
      </button>
    </div>
  );
}