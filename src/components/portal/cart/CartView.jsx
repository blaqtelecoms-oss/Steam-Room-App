import React, { useState } from "react";
import { useCart } from "@/components/portal/cart/CartContext";
import { startYocoCheckout } from "@/lib/yoco";
import { Minus, Plus, Trash2, ShoppingCart, ShoppingBag, CreditCard, Loader2 } from "lucide-react";

export default function CartView({ onGoShop }) {
  const { items, removeItem, updateQty, clear, subtotal } = useCart();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const checkout = async () => {
    if (items.length === 0) return;
    setPaying(true);
    setError("");
    try {
      await startYocoCheckout({
        amount: subtotal,
        type: "merchandise",
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        onSuccess: () => clear(),
        onError: (e) => { setError(e?.message || "Payment failed."); setPaying(false); },
        onClose: () => setPaying(false),
      });
    } catch (e) {
      setError(e?.message || "Could not start checkout. Please try again.");
      setPaying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
          <ShoppingCart className="w-7 h-7 text-primary" />
        </div>
        <p className="font-semibold text-sm mb-1">Your cart is empty</p>
        <p className="text-xs text-muted-foreground mb-5">Browse the shop to add merchandise.</p>
        <button onClick={onGoShop} className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-xs font-semibold uppercase tracking-wide">
          <ShoppingBag className="w-4 h-4" /> Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:max-w-2xl lg:mx-auto">
      <h3 className="font-display text-sm tracking-wide mb-1">YOUR CART</h3>
      {items.map((i) => (
        <div key={i.id} className="rounded-2xl border border-primary/15 bg-white/[0.03] p-3 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center overflow-hidden shrink-0">
            {i.image_url ? (
              <img src={i.image_url} alt={i.name} className="w-full h-full object-cover" />
            ) : (
              <ShoppingBag className="w-5 h-5 text-primary/40" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight truncate">{i.name}</p>
            <p className="font-display text-sm text-lime-soft mt-0.5">R{i.price.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => updateQty(i.id, i.qty - 1)} className="w-7 h-7 rounded-lg border border-primary/20 bg-background flex items-center justify-center hover:bg-primary/10">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-semibold w-5 text-center">{i.qty}</span>
            <button onClick={() => updateQty(i.id, i.qty + 1)} className="w-7 h-7 rounded-lg border border-primary/20 bg-background flex items-center justify-center hover:bg-primary/10">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <button onClick={() => removeItem(i.id)} className="w-7 h-7 rounded-lg border border-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive/10 shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subtotal</span>
        <span className="font-display text-xl text-primary">R{subtotal.toFixed(2)}</span>
      </div>

      <button onClick={checkout} disabled={paying} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold uppercase tracking-wide shadow-lg shadow-primary/25 disabled:opacity-60">
        {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} Pay with card
      </button>
      {error && <p className="text-[11px] text-destructive text-center">{error}</p>}
      <p className="text-[11px] text-muted-foreground text-center">Secure card payment via Yoco. You'll return here to confirm.</p>
    </div>
  );
}