import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Package, CheckCircle2, XCircle, Clock, ShoppingBag, FileDown, Truck, X,
} from "lucide-react";
import { jsPDF } from "jspdf";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    (async () => {
      const all = await base44.entities.Order.list("-created_date", 500);
      setOrders(all.filter((o) => o.type === "merchandise"));
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "paid");
    const revenue = paid.reduce((s, o) => s + (Number(o.amount) || 0), 0);
    const pendingFulfillment = paid.filter((o) => o.fulfillment_status === "pending");
    const fulfilled = paid.filter((o) => o.fulfillment_status === "fulfilled");
    return { revenue, pendingCount: pendingFulfillment.length, fulfilledCount: fulfilled.length, totalOrders: orders.length };
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === "all") return true;
      if (filter === "paid_pending") return o.status === "paid" && o.fulfillment_status === "pending";
      if (filter === "fulfilled") return o.fulfillment_status === "fulfilled";
      if (filter === "cancelled") return o.fulfillment_status === "cancelled";
      if (filter === "unpaid") return o.status === "pending";
      return true;
    });
  }, [orders, filter]);

  const updateFulfillment = async (id, status) => {
    setProcessing(id);
    try {
      await base44.entities.Order.update(id, { fulfillment_status: status });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, fulfillment_status: status } : o)));
    } catch {}
    setProcessing(null);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const pw = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("SR FITS — Online Shop Sales Report", pw / 2, y, { align: "center" });
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${now.toLocaleString("en-ZA")}`, pw / 2, y, { align: "center" });
    y += 8;

    doc.setDrawColor(200, 168, 77);
    doc.roundedRect(14, y, pw - 28, 24, 3, 3);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SUMMARY", 20, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Total Revenue: R ${stats.revenue.toFixed(2)}`, 20, y + 14);
    doc.text(`Orders: ${stats.totalOrders}`, 20, y + 20);
    doc.text(`Pending Fulfillment: ${stats.pendingCount}`, pw / 2, y + 14);
    doc.text(`Fulfilled: ${stats.fulfilledCount}`, pw / 2, y + 20);
    y += 30;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("ORDERS", 14, y);
    y += 6;
    doc.setFontSize(8);
    doc.text("Reference", 16, y);
    doc.text("Amount", 70, y);
    doc.text("Payment", 95, y);
    doc.text("Fulfillment", 120, y);
    doc.text("Date", 160, y);
    y += 4;
    doc.line(14, y, pw - 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");

    filtered.forEach((o) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text((o.reference || "").substring(0, 20), 16, y);
      doc.text(`R${o.amount}`, 70, y);
      doc.text(o.status, 95, y);
      doc.text(o.fulfillment_status || "pending", 120, y);
      doc.text((o.created_date || "").slice(0, 10), 160, y);
      y += 5;
    });

    doc.save(`SR_FITS_Sales_Report_${now.toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const fmtMoney = (n) => `R${n.toFixed(0)}`;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-primary/20 bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center"><ShoppingBag className="w-3.5 h-3.5 text-primary" /></div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Shop Revenue</p>
          </div>
          <p className="font-display text-lg text-primary">{fmtMoney(stats.revenue)}</p>
        </div>
        <div className="rounded-2xl border border-accent/20 bg-white/[0.03] p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center"><Clock className="w-3.5 h-3.5 text-accent" /></div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">To Fulfill</p>
          </div>
          <p className="font-display text-lg text-accent">{stats.pendingCount}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={exportPDF} className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide">
          <FileDown className="w-3.5 h-3.5" /> Sales PDF
        </button>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg bg-card border border-primary/20 px-3 py-2 text-xs outline-none focus:border-primary">
          <option value="all">All Orders</option>
          <option value="paid_pending">Paid — To Fulfill</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
          <option value="unpaid">Unpaid / Pending</option>
        </select>
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-primary/15 bg-white/[0.02] p-6 text-center">
          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No orders match this filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const isOpen = expanded === o.id;
            const payTone = o.status === "paid" ? "bg-primary/15 text-primary" : o.status === "failed" ? "bg-destructive/15 text-destructive" : "bg-yellow-500/15 text-yellow-400";
            const fulTone = o.fulfillment_status === "fulfilled" ? "bg-primary/15 text-primary" : o.fulfillment_status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent";
            return (
              <div key={o.id} className="rounded-xl border border-primary/15 bg-card p-3">
                <button onClick={() => setExpanded(isOpen ? null : o.id)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{o.reference}</p>
                      <p className="text-[11px] text-muted-foreground">{o.email || "No email"} · {(o.created_date || "").slice(0, 10)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-sm text-primary">R{o.amount}</p>
                      <div className="flex gap-1 justify-end mt-1">
                        <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${payTone}`}>{o.status}</span>
                        <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${fulTone}`}>{o.fulfillment_status || "pending"}</span>
                      </div>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-primary/10 space-y-2">
                    {o.items && o.items.length > 0 ? (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Items</p>
                        {o.items.map((it, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span>{it.qty}× {it.name}</span>
                            <span className="text-muted-foreground">R{(it.qty * it.price).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">{o.description || "No item details"}</p>
                    )}

                    {o.status === "paid" && (
                      <div className="flex gap-2 pt-2">
                        {o.fulfillment_status === "pending" && (
                          <>
                            <button
                              onClick={() => updateFulfillment(o.id, "fulfilled")}
                              disabled={processing === o.id}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-60"
                            >
                              {processing === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />} Mark Fulfilled
                            </button>
                            <button
                              onClick={() => updateFulfillment(o.id, "cancelled")}
                              disabled={processing === o.id}
                              className="flex items-center justify-center gap-1.5 rounded-lg border border-destructive/40 text-destructive px-3 py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-60"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {o.fulfillment_status === "fulfilled" && (
                          <div className="flex items-center gap-1.5 text-xs text-primary">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Order fulfilled
                          </div>
                        )}
                        {o.fulfillment_status === "cancelled" && (
                          <div className="flex items-center gap-1.5 text-xs text-destructive">
                            <XCircle className="w-3.5 h-3.5" /> Order cancelled
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}