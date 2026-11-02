import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { isVideoMedia, mediaFileName } from "@/lib/media";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import DownloadButton from "@/components/gallery/DownloadButton";
import { ImageOff, Play } from "lucide-react";

export default function GalleryView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    base44.entities.GalleryItem.filter({ active: true }, "order", 200)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-xs text-muted-foreground">Loading gallery…</p>;
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-card p-8 text-center">
        <ImageOff className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-semibold">No gallery media yet</p>
        <p className="text-xs text-muted-foreground mt-1">Photos and videos from the gym will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-display text-[10px] tracking-widest text-primary uppercase">Gallery</p>
        <h2 className="font-space font-bold text-lg">From the gym floor</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const video = isVideoMedia(item.media_url, item.media_type);
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => setActive(item)}
                className="group relative w-full aspect-square overflow-hidden rounded-xl border border-primary/20 bg-card"
              >
                {video ? (
                  <>
                    <video src={item.media_url} muted preload="metadata" playsInline className="w-full h-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-7 h-7 text-primary" fill="currentColor" />
                    </span>
                  </>
                ) : (
                  <img
                    src={item.media_url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2 py-1.5">
                  <span className="block text-left text-[11px] font-semibold text-white truncate">{item.title}</span>
                </span>
              </button>
              <DownloadButton
                url={item.media_url}
                filename={mediaFileName(item.title, item.media_url)}
                className="absolute right-2 top-2 h-7 w-7"
              />
            </div>
          );
        })}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl border-primary/30 bg-black p-3">
          <DialogTitle className="sr-only">{active?.title}</DialogTitle>
          {active && (
            <>
              {isVideoMedia(active.media_url, active.media_type) ? (
                <video src={active.media_url} controls autoPlay playsInline className="w-full max-h-[75vh] rounded-lg" />
              ) : (
                <img src={active.media_url} alt={active.title} className="w-full max-h-[75vh] object-contain rounded-lg" />
              )}
              <div className="flex items-center justify-between gap-3 px-1 pb-1">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{active.title}</p>
                  {active.caption && <p className="text-xs text-muted-foreground mt-0.5">{active.caption}</p>}
                </div>
                <DownloadButton
                  url={active.media_url}
                  filename={mediaFileName(active.title, active.media_url)}
                  showLabel
                  className="shrink-0 h-9 px-3"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
