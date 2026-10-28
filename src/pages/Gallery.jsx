import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Lock, LogIn, Upload, Trash2, Image as ImageIcon, Video, Loader2, Images } from "lucide-react";

const BUCKET = "gallery";
const VIDEO_RE = /\.(mp4|webm|mov|m4v)$/i;

const isVideo = (name) => VIDEO_RE.test(name);

export default function Gallery() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const isAdmin = isAuthenticated && user?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase.storage
        .from(BUCKET)
        .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (err) throw err;
      const files = (data || []).filter((f) => !f.id.endsWith("/"));
      setItems(files);
    } catch (e) {
      setError(e?.message || "Could not load gallery. Make sure the gallery bucket exists.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const path = `${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
      }
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (err) {
      setError(err?.message || "Upload failed. Make sure your account is an admin and the gallery bucket exists.");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const { error: delErr } = await supabase.storage.from(BUCKET).remove([name]);
      if (delErr) throw delErr;
      setItems((prev) => prev.filter((i) => i.name !== name));
    } catch (err) {
      setError(err?.message || "Delete failed.");
    }
  };

  // Not logged in → prompt sign-in (gallery is for signed-in users only)
  if (isLoadingAuth) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-primary/25 bg-card p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center mb-3 mx-auto">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-sm tracking-widest text-primary mb-2">MEMBERS ONLY</h1>
          <p className="text-xs text-muted-foreground mb-5">Sign in to view the SR Fits gallery.</p>
          <button
            onClick={navigateToLogin}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-8 px-4 min-h-screen lg:pt-24 lg:pb-16 lg:px-8 lg:max-w-7xl lg:mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Images className="w-5 h-5 text-primary" />
          <div>
            <p className="font-display text-[10px] tracking-widest text-primary">SR FITS</p>
            <h1 className="font-space font-bold text-xl">Gallery</h1>
          </div>
        </div>
        {isAdmin && (
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded-xl px-4 py-2.5 cursor-pointer hover:bg-primary/90 transition-colors">
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading…" : "Upload"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={onFiles}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {!isAdmin && (
        <p className="text-xs text-muted-foreground mb-4">
          Signed in as {user?.email}. Only admins can upload and manage media.
        </p>
      )}

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No media in the gallery yet.</p>
          {isAdmin && <p className="text-xs text-muted-foreground mt-1">Use Upload to add images or videos.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => {
            const { data } = supabase.storage.from(BUCKET).getPublicUrl(item.name);
            const url = data.publicUrl;
            const video = isVideo(item.name);
            return (
              <div
                key={item.id}
                className="group relative aspect-square rounded-xl overflow-hidden border border-primary/20 bg-white/[0.02]"
              >
                {video ? (
                  <video src={url} className="w-full h-full object-cover" controls muted playsInline />
                ) : (
                  <img src={url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                )}
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest bg-background/70 backdrop-blur border border-primary/30 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                  {video ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  {video ? "Video" : "Image"}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => remove(item.name)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/70 backdrop-blur border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
