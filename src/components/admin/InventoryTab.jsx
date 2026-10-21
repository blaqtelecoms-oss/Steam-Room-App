import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Plus, Pencil, Trash2, X, Package, ShoppingBag, AlertTriangle, Save,
} from "lucide-react";

const CATEGORIES = ["Apparel", "Accessories", "Supplements"];

export default function InventoryTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const prods = await base44.entities.Product.list("-created_date", 500);
    setProducts(prods);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "All" ? products : products.filter((p) => p.category === filter);

  const lowStock = products.filter((p) => (Number(p.stock) || 0) <= 5);

  const save = async (data) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await base44.entities.Product.update(editing.id, data);
      } else {
        await base44.entities.Product.create(data);
      }
      setEditing(null);
      await load();
    } catch {}
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await base44.entities.Product.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = async (p, delta) => {
    const newStock = Math.max(0, (Number(p.stock) || 0) + delta);
    await base44.entities.Product.update(p.id, { stock: newStock });
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock: newStock } : x)));
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  if (editing) return <ProductForm initial={editing} onSave={save} onCancel={() => setEditing(null)} saving={saving} />;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-primary/20 bg-white/[0.03] p-3 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">Products</p>
          <p className="font-display text-lg text-primary">{products.length}</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-white/[0.03] p-3 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">Low Stock</p>
          <p className="font-display text-lg text-accent">{lowStock.length}</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-white/[0.03] p-3 text-center">
          <p className="text-[10px] uppercase text-muted-foreground">Out of Stock</p>
          <p className="font-display text-lg text-destructive">{products.filter((p) => !Number(p.stock)).length}</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
          <p className="text-xs text-accent">{lowStock.length} product(s) running low on stock (5 or less).</p>
        </div>
      )}

      {/* Add + filter */}
      <div className="flex items-center gap-2">
        <button onClick={() => setEditing({})} className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide">
          <Plus className="w-3.5 h-3.5" /> Add Product
        </button>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap border transition-colors ${filter === c ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-primary/20 text-muted-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-primary/15 bg-white/[0.02] p-6 text-center">
            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No products in this category.</p>
          </div>
        ) : (
          filtered.map((p) => {
            const stock = Number(p.stock) || 0;
            const stockTone = stock === 0 ? "text-destructive" : stock <= 5 ? "text-accent" : "text-primary";
            return (
              <div key={p.id} className="rounded-xl border border-primary/15 bg-card p-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center overflow-hidden shrink-0">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-primary/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <p className="text-[10px] text-primary uppercase tracking-wide">{p.category}</p>
                    <p className="font-display text-sm text-primary mt-0.5">R{p.price}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => adjustStock(p, -1)} className="w-6 h-6 rounded border border-primary/20 flex items-center justify-center hover:bg-primary/10 text-xs">−</button>
                      <span className={`text-sm font-semibold w-8 text-center ${stockTone}`}>{stock}</span>
                      <button onClick={() => adjustStock(p, 1)} className="w-6 h-6 rounded border border-primary/20 flex items-center justify-center hover:bg-primary/10 text-xs">+</button>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(p)} className="w-7 h-7 rounded border border-primary/20 flex items-center justify-center hover:bg-primary/10">
                        <Pencil className="w-3 h-3 text-primary" />
                      </button>
                      <button onClick={() => remove(p.id)} className="w-7 h-7 rounded border border-destructive/20 flex items-center justify-center hover:bg-destructive/10">
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
                {p.description && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{p.description}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    price: initial?.price || "",
    category: initial?.category || "Apparel",
    stock: initial?.stock || 0,
    image_url: initial?.image_url || "",
    description: initial?.description || "",
  });

  const submit = (e) => {
    e.preventDefault();
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock) || 0 });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm tracking-wide text-primary">{initial?.id ? "EDIT PRODUCT" : "NEW PRODUCT"}</p>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card p-4 space-y-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Price (R)</span>
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Stock</span>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
          </label>
        </div>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Category</span>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-lg bg-card border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Image URL</span>
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Description</span>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary resize-none" />
        </label>
      </div>

      <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-60">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Product
      </button>
    </form>
  );
}