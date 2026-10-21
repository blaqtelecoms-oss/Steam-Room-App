import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Check, Loader2, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const divisions = [
  { id: "Women's", label: "Women's" },
  { id: "Men's", label: "Men's" },
  { id: "Elite Athlete", label: "Elite" },
];

const empty = {
  full_name: "",
  phone: "",
  division: "Men's",
  before_front: "",
  before_side: "",
  before_back: "",
  after_front: "",
  after_side: "",
  after_back: "",
};

function ImageUpload({ label, value, onChange, required }) {
  const [busy, setBusy] = useState(false);
  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file, bucket: "challenge" });
      onChange(file_url);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <Label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}{required && " *"}</Label>
      <label className="mt-1 relative flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-primary/30 bg-white/[0.02] hover:border-primary/60 transition-colors cursor-pointer overflow-hidden h-28">
        {value ? (
          <>
            <img src={value} alt={label} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          </>
        ) : busy ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <>
            <Upload className="w-5 h-5 text-primary/70" />
            <span className="text-[10px] text-muted-foreground">Upload</span>
          </>
        )}
        <input type="file" accept="image/*" onChange={handle} className="hidden" />
      </label>
    </div>
  );
}

export default function ChallengeForm() {
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name) { setError("Please add your name."); return; }
    if (!form.before_front || !form.before_side || !form.before_back) {
      setError("All 3 before photos (front, side, back) are required.");
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.Challenge.create(form);
      setDone(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center mb-4">
          <Trophy className="w-7 h-7 text-primary" />
        </div>
        <h3 className="font-display text-sm tracking-widest text-primary mb-2">ENTRY RECEIVED</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You're in for the <span className="text-foreground font-semibold">{form.division}</span> division. Upload your 3 after photos by October 6th to complete your entry.
        </p>
        <Button onClick={() => { setDone(false); setForm(empty); }} variant="outline" className="mt-5 border-primary/30 text-primary hover:bg-primary/10">
          Submit Another Entry
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Choose Your Division</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {divisions.map((d) => {
            const active = form.division === d.id;
            return (
              <button key={d.id} type="button" onClick={() => set("division", d.id)}
                className={`rounded-xl border px-2 py-3 text-center transition-all ${active ? "border-primary bg-primary/10" : "border-primary/20 bg-white/[0.02] hover:border-primary/40"}`}>
                <span className={`block text-xs font-bold uppercase tracking-wide ${active ? "text-primary" : "text-foreground"}`}>{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Name</Label>
          <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Your name" className="mt-1.5 bg-white/[0.03] border-primary/20" />
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optional" className="mt-1.5 bg-white/[0.03] border-primary/20" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">Before Photos</p>
        <div className="grid grid-cols-3 gap-2">
          <ImageUpload label="Front" required value={form.before_front} onChange={(u) => set("before_front", u)} />
          <ImageUpload label="Side" required value={form.before_side} onChange={(u) => set("before_side", u)} />
          <ImageUpload label="Back" required value={form.before_back} onChange={(u) => set("before_back", u)} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">After Photos <span className="text-[10px] normal-case">(due Oct 6)</span></p>
        <div className="grid grid-cols-3 gap-2">
          <ImageUpload label="Front" value={form.after_front} onChange={(u) => set("after_front", u)} />
          <ImageUpload label="Side" value={form.after_side} onChange={(u) => set("after_side", u)} />
          <ImageUpload label="Back" value={form.after_back} onChange={(u) => set("after_back", u)} />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-semibold uppercase tracking-wide rounded-xl">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Entry — R100"}
      </Button>
      <p className="text-center text-[10px] text-muted-foreground">R100 joining fee · Members only · T&amp;Cs apply</p>
    </form>
  );
}