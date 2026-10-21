import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Image as ImageIcon, Video, Power, Loader2 } from "lucide-react";

export default function AdvertsTab() {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: "", media_type: "image", link_url: "/challenge", active: true, order: 0 });
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    base44.entities.Advert.list("order", 100)
      .then(setAdverts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file, bucket: "adverts" });
      setForm((f) => ({ ...f, image_url: file_url, media_type: isVideo ? "video" : "image" }));
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const add = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Advert.create(form);
      setForm({ title: "", subtitle: "", image_url: "", media_type: "image", link_url: "/challenge", active: true, order: 0 });
      load();
    } catch (err) {
      setError(err?.message || "Failed to add advert. Make sure your account is an admin.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (a) => {
    base44.entities.Advert.update(a.id, { active: !a.active }).then(load);
  };

  const remove = (a) => {
    base44.entities.Advert.delete(a.id).then(load);
  };

  const isVideo = (a) => a.media_type === "video" || (a.image_url || "").match(/\.(mp4|webm|mov|m4v)$/i);

  return (
    <div className="space-y-5">
      {/* Add form */}
      <form onSubmit={add} className="rounded-2xl border border-primary/20 bg-card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Plus className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Add Advert</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg bg-white/[0.03] border border-primary/15 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            placeholder="Subtitle (small label)"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="rounded-lg bg-white/[0.03] border border-primary/15 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        {/* File upload (image or video) */}
        <div className="rounded-lg border border-dashed border-primary/20 bg-white/[0.02] p-3">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={onFile}
              className="text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs file:font-semibold"
            />
            {uploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            {form.image_url && (
              <span className="text-[10px] uppercase tracking-widest text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                {form.media_type}
              </span>
            )}
          </div>
          {form.image_url && (
            <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-primary/20 bg-white/5 flex items-center justify-center">
              {form.media_type === "video" ? (
                <video src={form.image_url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
              )}
            </div>
          )}
        </div>

        <input
          placeholder="…or paste Media URL"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value, media_type: (e.target.value.match(/\.(mp4|webm|mov|m4v)$/i) ? "video" : "image") })}
          className="w-full rounded-lg bg-white/[0.03] border border-primary/15 px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="Link URL (e.g. /challenge)"
            value={form.link_url}
            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            className="rounded-lg bg-white/[0.03] border border-primary/15 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            type="number"
            placeholder="Order (lower shows first)"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className="rounded-lg bg-white/[0.03] border border-primary/15 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="accent-primary"
          />
          Active (show on home)
        </label>
        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</p>
        )}
        <button type="submit" disabled={uploading || saving} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Adding…" : "Add Advert"}
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm mb-1">Current Adverts</h3>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : adverts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No adverts yet.</p>
        ) : (
          adverts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border border-primary/15 bg-white/[0.02] p-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-primary/20 shrink-0 bg-white/5 flex items-center justify-center">
                {a.image_url ? (
                  isVideo(a) ? (
                    <video src={a.image_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
                  )
                ) : (
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate flex items-center gap-1.5">
                  {isVideo(a) && <Video className="w-3.5 h-3.5 text-primary" />}
                  {a.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{a.link_url || "/challenge"}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full border ${a.active ? "border-primary/40 text-primary" : "border-white/10 text-muted-foreground"}`}>
                {a.active ? "Active" : "Off"}
              </span>
              <button onClick={() => toggle(a)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary" title="Toggle active">
                <Power className="w-4 h-4" />
              </button>
              <button onClick={() => remove(a)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}