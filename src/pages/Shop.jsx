import React, { useState } from "react";
import { CartProvider, useCart } from "@/components/portal/cart/CartContext";
import ShopView from "@/components/portal/ShopView";
import CartView from "@/components/portal/cart/CartView";
import { ShoppingBag, ShoppingCart } from "lucide-react";

export default function Shop() {
  const [view, setView] = useState("shop");

  return (
    <CartProvider>
      <div className="pt-20 pb-4 px-4 min-h-screen lg:pt-28 lg:pb-16 lg:px-8 lg:max-w-7xl lg:mx-auto">
        <div className="mb-4">
          <p className="font-display text-[10px] tracking-widest text-primary">SR FITS</p>
          <h1 className="font-space font-bold text-2xl lg:text-4xl">Shop</h1>
        </div>
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setView("shop")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${view === "shop" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-primary/20 text-muted-foreground"}`}
          >
            <ShoppingBag className="w-4 h-4" /> Shop
          </button>
          <button
            onClick={() => setView("cart")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${view === "cart" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-primary/20 text-muted-foreground"}`}
          >
            <ShoppingCart className="w-4 h-4" /> Cart <CartBadge />
          </button>
        </div>
        {view === "shop" && <ShopView />}
        {view === "cart" && <CartView onGoShop={() => setView("shop")} />}
      </div>
    </CartProvider>
  );
}

function CartBadge() {
  const { count } = useCart();
  if (!count) return null;
  return <span className="ml-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{count}</span>;
}