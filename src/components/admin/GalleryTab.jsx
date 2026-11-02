import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { isVideoMedia } from "@/lib/media";
import { Plus, Trash2, Image as ImageIcon, Video, Power, Loader2 } from "lucide-react";

const EMPTY_FORM = { title: "", caption: "", media_url: "", media_type: "image", active: true, order: 0 };

export default function GalleryTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    base44.entities.GalleryItem.list("order", 200)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file, bucket: "gallery" });
      setForm((f) => ({ ...f, media_url: file_url, media_type: file.type.startsWith("video/") ? "video" : "image" }));
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const add = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.media_url.trim()) {
      setError("Add a title and an image/video before publishing.");
      return;
    }
    setSaving(true);
    try {
      await base44.entities.GalleryItem.create({ ...form, title: form.title.trim(), media_url: form.media_url.trim() });
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err?.message || "Failed to add media. Make sure your account is an admin.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (item) => {
    base44.entities.GalleryItem.update(item.id, { active: !item.active }).then(load);
  };

  const remove = (item) => {
    base44.entities.GalleryItem.delete(item.id).then(load);
  };

  return (
    <div className="space-y-5">
      {/* Add form */}
      <form onSubmit={add} className="rounded-2xl border border-primary/20 bg-card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Plus className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Add Gallery Media</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg bg-white/[0.03] border border-primary/15 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            placeholder="Caption (optional)"
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
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
            {form.media_url && (
              <span className="text-[10px] uppercase tracking-widest text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                {isVideoMedia(form.media_url, form.media_type) ? "video" : "image"}
              </span>
            )}
          </div>
          {form.media_url && (
            <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-primary/20 bg-white/5 flex items-center justify-center">
              {isVideoMedia(form.media_url, form.media_type) ? (
                <video src={form.media_url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={form.media_url} alt="preview" className="w-full h-full object-cover" />
              )}
            </div>
          )}
        </div>

        <input
          placeholder="…or paste Media URL (image or video)"
          value={form.media_url}
          onChange={(e) => setForm({
            ...form,
            media_url: e.target.value,
            media_type: isVideoMedia(e.target.value, "") ? "video" : "image",
          })}
          className="w-full rounded-lg bg-white/[0.03] border border-primary/15 px-3 py-2 text-sm outline-none focus:border-primary"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Order (lower shows first)"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className="rounded-lg bg-white/[0.03] border border-primary/15 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="accent-primary"
            />
            Published (visible to members)
          </label>
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={uploading || saving}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Adding…" : "Add to Gallery"}
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm mb-1">Gallery Media</h3>
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nothing in the gallery yet.</p>
        ) : (
          items.map((item) => {
            const video = isVideoMedia(item.media_url, item.media_type);
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-primary/15 bg-white/[0.02] p-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-primary/20 shrink-0 bg-white/5 flex items-center justify-center">
                  {item.media_url ? (
                    video ? (
                      <video src={item.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate flex items-center gap-1.5">
                    {video && <Video className="w-3.5 h-3.5 text-primary shrink-0" />}
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{item.caption || (video ? "Video" : "Image")}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full border ${item.active ? "border-primary/40 text-primary" : "border-white/10 text-muted-foreground"}`}>
                  {item.active ? "Published" : "Draft"}
                </span>
                <button onClick={() => toggle(item)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary" title="Toggle published">
                  <Power className="w-4 h-4" />
                </button>
                <button onClick={() => remove(item)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
