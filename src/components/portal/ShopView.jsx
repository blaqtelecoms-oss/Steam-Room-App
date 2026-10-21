import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShoppingBag, Plus, Check } from "lucide-react";
import { useCart } from "@/components/portal/cart/CartContext";

const categories = ["All", "Apparel", "Accessories", "Supplements"];

export default function ShopView() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState({});
  const [category, setCategory] = useState("All");

  useEffect(() => {
    (async () => {
      const [prods, prs] = await Promise.all([
        base44.entities.Product.list(),
        base44.entities.Promotion.list(),
      ]);
      setProducts(prods);
      setPromos(prs);
      setLoading(false);
    })();
  }, []);

  const handleAdd = (p) => {
    addItem(p);
    setAdded((s) => ({ ...s, [p.id]: true }));
    setTimeout(() => setAdded((s) => ({ ...s, [p.id]: false })), 1200);
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground text-sm">Loading shop…</div>;

  return (
    <div className="space-y-6">
      {promos.length > 0 && (
        <div>
          <h3 className="font-display text-sm tracking-wide mb-3 text-accent">PROMOTIONS</h3>
          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
            {promos.map((pr) => (
              <div key={pr.id} className="relative rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-4 overflow-hidden">
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase">{pr.badge || pr.discount || "Offer"}</div>
                <p className="font-semibold text-sm pr-16">{pr.title}</p>
                {pr.description && <p className="text-xs text-muted-foreground mt-1">{pr.description}</p>}
                {pr.valid_until && <p className="text-[10px] text-accent mt-2">Valid until {new Date(pr.valid_until).toLocaleDateString("en-ZA")}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="font-display text-sm tracking-wide mb-3">MERCHANDISE</h3>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap border transition-colors ${category === c ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-primary/20 text-muted-foreground hover:text-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>
        {(() => {
          const filtered = category === "All" ? products : products.filter((p) => p.category === category);
          if (filtered.length === 0) {
            return <p className="text-sm text-muted-foreground py-8 text-center">No {category.toLowerCase()} in stock yet — check back soon.</p>;
          }
          return (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-2xl border border-primary/15 bg-white/[0.03] p-3 flex flex-col">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center mb-2 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-primary/40" />
                  )}
                </div>
                <p className="text-sm font-medium leading-tight">{p.name}</p>
                {p.category && <p className="text-[10px] text-primary uppercase tracking-wide mt-0.5">{p.category}</p>}
                <p className="font-display text-base text-lime-soft mt-1">R{p.price}</p>
                <button onClick={() => handleAdd(p)} className={`mt-2 flex items-center justify-center gap-1 w-full rounded-lg py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${added[p.id] ? "bg-primary text-primary-foreground border border-primary" : "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"}`}>
                  {added[p.id] ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add to cart</>}
                </button>
              </div>
            ))}
          </div>
          );
        })()}
      </div>
    </div>
  );
}