import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Plus, Dumbbell, Loader2 } from "lucide-react";

export default function ProgramView({ member }) {
  const [programs, setPrograms] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), weight: "", notes: "" });

  const load = async () => {
    try {
      const res = await base44.functions.invoke("GetMemberPortalData", { member_id: member.id });
      setPrograms(res.data?.programs || []);
      setProgress(res.data?.progress || []);
    } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [member.id]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.functions.invoke("SaveProgress", {
        member_id: member.id,
        date: form.date,
        weight: form.weight ? Number(form.weight) : null,
        notes: form.notes || null,
      });
      setForm({ date: new Date().toISOString().slice(0, 10), weight: "", notes: "" });
      setShowForm(false);
      load();
    } catch (e) {}
    setSaving(false);
  };

  const chartData = [...progress].reverse().map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }),
    weight: p.weight,
  }));

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-5 lg:max-w-3xl">
      {chartData.length > 1 && (
        <div className="rounded-2xl border border-primary/15 bg-white/[0.03] p-4">
          <p className="font-display text-sm tracking-wide mb-3">WEIGHT PROGRESS</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="hsl(43 74% 61% / 0.1)" />
              <XAxis dataKey="date" stroke="hsl(0 0% 55%)" fontSize={10} tickLine={false} />
              <YAxis stroke="hsl(0 0% 55%)" fontSize={10} tickLine={false} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 7%)", border: "1px solid hsl(43 74% 61% / 0.3)", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="weight" stroke="hsl(43 74% 61%)" strokeWidth={2} dot={{ fill: "hsl(43 74% 61%)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm tracking-wide">YOUR PROGRAM</h3>
          <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1 text-xs font-semibold text-primary">
            <Plus className="w-4 h-4" /> Log workout
          </button>
        </div>
        {showForm && (
          <form onSubmit={submit} className="rounded-2xl border border-primary/30 bg-white/[0.03] p-4 space-y-3 mb-3">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-xl bg-background border border-primary/20 px-3 py-2 text-sm" required />
            <input type="number" step="0.1" placeholder="Weight (kg)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="w-full rounded-xl bg-background border border-primary/20 px-3 py-2 text-sm" />
            <input type="text" placeholder="Notes / PR" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl bg-background border border-primary/20 px-3 py-2 text-sm" />
            <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2 text-xs font-semibold uppercase tracking-wide disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save check-in"}
            </button>
          </form>
        )}
        {programs.length === 0 ? (
          <div className="rounded-2xl border border-primary/15 bg-white/[0.03] p-6 text-center">
            <Dumbbell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No personalised program assigned yet. Your trainer will add one soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((prog) => (
              <div key={prog.id} className="rounded-2xl border border-primary/15 bg-white/[0.03] p-4">
                <p className="font-semibold text-sm">{prog.title}</p>
                {prog.focus_area && <p className="text-[11px] text-primary uppercase tracking-wide mt-0.5">{prog.focus_area}</p>}
                {prog.description && <p className="text-xs text-muted-foreground mt-2">{prog.description}</p>}
                {prog.exercises?.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {prog.exercises.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-foreground">{ex.name}</span>
                        <span className="text-muted-foreground">{ex.sets}×{ex.reps} {ex.weight ? `· ${ex.weight}` : ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {progress.length > 0 && (
        <div>
          <h3 className="font-display text-sm tracking-wide mb-3">RECENT CHECK-INS</h3>
          <div className="space-y-2">
            {progress.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-primary/15 bg-white/[0.03] p-3">
                <div>
                  <p className="text-sm font-medium">{new Date(p.date).toLocaleDateString("en-ZA")}</p>
                  {p.notes && <p className="text-[11px] text-muted-foreground">{p.notes}</p>}
                </div>
                {p.weight && <p className="text-sm font-semibold text-primary">{p.weight} kg</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}