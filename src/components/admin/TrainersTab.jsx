import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Save, Trash2, Loader2, ImageIcon, Eye, EyeOff, Upload } from "lucide-react";

const EMPTY = {
  name: "",
  specialty: "",
  image: "",
  image_fit: "cover",
  image_position: "top",
  bio: "",
  certifications: "",
  experience: "",
  rating: 5,
  order: 0,
  active: true,
  sr_code: "",
};

export default function TrainersTab() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    const res = await base44.entities.Trainer.filter({}, "order", 100);
    setTrainers(res || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{trainers.length} trainer(s)</p>
        <button onClick={() => setShowAdd((s) => !s)} className="flex items-center gap-1 text-xs font-semibold text-primary border border-primary/20 rounded-lg px-3 py-1.5">
          <Plus className="w-3.5 h-3.5" /> Add trainer
        </button>
      </div>

      {showAdd && <TrainerForm onDone={() => { setShowAdd(false); load(); }} />}

      {trainers.length === 0 ? (
        <p className="text-xs text-muted-foreground">No trainers yet. Add one to populate the Trainers page.</p>
      ) : (
        <div className="space-y-3">
          {trainers.map((t) => (
            <TrainerCard key={t.id} trainer={t} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrainerForm({ initial, onDone }) {
  const [f, setF] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const onUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file, bucket: "trainers" });
      upd("image", res.file_url);
    } catch (e) {
      setErr(e?.message || "Upload failed.");
    }
    setUploading(false);
  };

  const submit = async () => {
    if (!f.name) { setErr("Name is required."); return; }
    setSaving(true);
    setErr("");
    try {
      const payload = {
        name: f.name,
        specialty: f.specialty,
        image: f.image,
        image_fit: f.image_fit || "cover",
        image_position: f.image_position || "top",
        bio: f.bio,
        certifications: (f.certifications || "").split(",").map((c) => c.trim()).filter(Boolean),
        experience: f.experience,
        rating: Number(f.rating) || 5,
        order: Number(f.order) || 0,
        active: f.active,
        sr_code: f.sr_code || "",
      };
      if (initial?.id) {
        await base44.entities.Trainer.update(initial.id, payload);
      } else {
        await base44.entities.Trainer.create(payload);
      }
      onDone();
    } catch (e) {
      setErr(e?.message || "Save failed.");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-white/[0.02] p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Inp label="Name" value={f.name} onChange={(v) => upd("name", v)} />
        <Inp label="Specialty" value={f.specialty} onChange={(v) => upd("specialty", v)} />
      </div>
      <Inp label="SR Code (login password)" value={f.sr_code} onChange={(v) => upd("sr_code", v)} />
      <div>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Photo</span>
        <div className="mt-1 flex items-center gap-2">
          <div className="w-14 h-14 rounded-lg overflow-hidden border border-primary/20 bg-white/[0.03] flex items-center justify-center shrink-0">
            {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
          </div>
          <label className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-primary/20 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? "Uploading..." : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </label>
        </div>
        <input
          value={f.image || ""}
          onChange={(e) => upd("image", e.target.value)}
          placeholder="...or paste image URL"
          className="mt-2 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-xs outline-none focus:border-primary"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Photo fit</span>
            <select value={f.image_fit || "cover"} onChange={(e) => upd("image_fit", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-xs outline-none focus:border-primary">
              <option value="cover">Cover (fill)</option>
              <option value="contain">Contain (full photo)</option>
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Photo position</span>
            <select value={f.image_position || "top"} onChange={(e) => upd("image_position", e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-xs outline-none focus:border-primary">
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>
        </div>
        <div className="mt-2 rounded-lg overflow-hidden border border-primary/20 bg-black/30 h-28">
          {f.image ? (
            <img
              src={f.image}
              alt=""
              className={`w-full h-full ${f.image_fit === "contain" ? "object-contain" : "object-cover"} ${f.image_position === "center" ? "object-center" : f.image_position === "bottom" ? "object-bottom" : "object-top"}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
          )}
        </div>
      </div>
      <label className="block">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Bio</span>
        <textarea value={f.bio} onChange={(e) => upd("bio", e.target.value)} rows={3} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
      </label>
      <Inp label="Certifications (comma separated)" value={f.certifications} onChange={(v) => upd("certifications", v)} />
      <div className="grid grid-cols-3 gap-2">
        <Inp label="Experience" value={f.experience} onChange={(v) => upd("experience", v)} />
        <Inp label="Rating" value={f.rating} onChange={(v) => upd("rating", v)} type="number" />
        <Inp label="Order" value={f.order} onChange={(v) => upd("order", v)} type="number" />
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={f.active} onChange={(e) => upd("active", e.target.checked)} className="accent-primary" />
        Active (shown on Trainers page)
      </label>
      {err && <p className="text-xs text-destructive">{err}</p>}
      <button onClick={submit} disabled={saving} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-xs font-semibold">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} {initial ? "Save changes" : "Add trainer"}
      </button>
    </div>
  );
}

function TrainerCard({ trainer, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleActive = async () => {
    setBusy(true);
    await base44.entities.Trainer.update(trainer.id, { active: !trainer.active });
    setBusy(false);
    onChanged();
  };
  const del = async () => {
    if (!confirm(`Delete ${trainer.name}?`)) return;
    setBusy(true);
    await base44.entities.Trainer.delete(trainer.id);
    setBusy(false);
    onChanged();
  };

  if (editing) {
    return (
      <div className="rounded-2xl border border-primary/25 bg-card p-3">
        <TrainerForm
          initial={{ ...trainer, certifications: (trainer.certifications || []).join(", ") }}
          onDone={() => { setEditing(false); onChanged(); }}
        />
        <button onClick={() => setEditing(false)} className="text-xs text-muted-foreground mt-2">Cancel</button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/15 bg-card p-3 flex gap-3">
      <div className="w-16 h-16 rounded-xl overflow-hidden border border-primary/20 shrink-0 bg-white/[0.03] flex items-center justify-center">
        {trainer.image ? <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{trainer.name}</p>
            <p className="text-primary text-xs">{trainer.specialty}</p>
          </div>
          <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full whitespace-nowrap ${trainer.active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{trainer.active ? "active" : "hidden"}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{trainer.bio}</p>
        <div className="flex gap-2 mt-2">
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-1.5 hover:bg-primary/10">
            <Save className="w-3 h-3" /> Edit
          </button>
          <button onClick={toggleActive} disabled={busy} className="flex items-center gap-1 text-xs font-semibold rounded-lg border border-primary/20 px-3 py-1.5 hover:bg-primary/10">
            {trainer.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {trainer.active ? "Hide" : "Show"}
          </button>
          <button onClick={del} disabled={busy} className="flex items-center gap-1 text-xs font-semibold rounded-lg border border-destructive/20 px-3 py-1.5 text-destructive hover:bg-destructive/10">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg bg-white/[0.03] border border-primary/20 px-3 py-2 text-sm outline-none focus:border-primary" />
    </label>
  );
}