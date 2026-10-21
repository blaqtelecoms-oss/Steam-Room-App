import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const isVideo = (a) => a.media_type === "video" || (a.image_url || "").match(/\.(mp4|webm|mov|m4v)$/i);

export default function AdvertBanner() {
  const [adverts, setAdverts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    base44.entities.Advert.filter({ active: true }, "order", 50)
      .then(setAdverts)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Alternate through active adverts
  useEffect(() => {
    if (paused || expanded || adverts.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % adverts.length), 6000);
    return () => clearInterval(t);
  }, [paused, expanded, adverts.length]);

  if (loaded && !adverts.length) return null;

  const current = adverts[index] || adverts[0];
  const active = expanded ? adverts.find((a) => a.id === expanded) : null;

  const renderMedia = (a, className, videoProps = {}) => {
    if (!a) return null;
    if (isVideo(a)) {
      return (
        <video
          ref={videoProps.autoPlay ? videoRef : undefined}
          src={a.image_url}
          className={className}
          muted
          loop
          playsInline
          preload="auto"
          {...videoProps}
        />
      );
    }
    return <img src={a.image_url} alt={a.title} className={className} {...videoProps} />;
  };

  return (
    <>
      {/* Inline alternating banner */}
      {current && (
        <div
          className="mb-8 max-w-xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            onClick={() => setExpanded(current.id)}
            className="group relative flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 hover:bg-primary/15 backdrop-blur-sm p-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/30 hover:border-primary cursor-pointer"
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden border border-primary/30 shrink-0 transition-all duration-300 group-hover:w-24 group-hover:h-24">
              {renderMedia(current, "w-full h-full object-cover", { autoPlay: true })}
            </div>
            <div className="flex-1 min-w-0">
              {current.subtitle && (
                <p className="text-primary text-[10px] font-semibold uppercase tracking-widest">{current.subtitle}</p>
              )}
              <p className="font-semibold text-sm leading-tight">{current.title}</p>
              <p className="text-muted-foreground text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {isVideo(current) ? "Click to view" : "Hover to expand"}
              </p>
            </div>
            <div className="flex items-center gap-1 text-primary text-xs font-semibold shrink-0 pr-2">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Alternation dots */}
          {adverts.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {adverts.map((a, i) => (
                <button
                  key={a.id}
                  onClick={(e) => { e.stopPropagation(); setIndex(i); }}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-1.5 bg-primary/30 hover:bg-primary/50"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full-page overlay */}
      {active && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-background/95 backdrop-blur-md animate-in fade-in duration-200">
          <button
            onClick={() => setExpanded(null)}
            aria-label="Close advert"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background border border-primary/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center justify-center w-full min-h-0 py-2">
            {isVideo(active) ? (
              <video
                src={active.image_url}
                className="max-h-full max-w-full rounded-lg shadow-2xl shadow-primary/20"
                controls
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
            ) : (
              <img
                src={active.image_url}
                alt={active.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl shadow-primary/20"
              />
            )}
          </div>
          <Link
            to={active.link_url || "/challenge"}
            onClick={() => setExpanded(null)}
            className="group flex flex-col items-center text-center mt-3 shrink-0"
          >
            {active.subtitle && (
              <p className="text-primary text-[10px] font-semibold uppercase tracking-widest">{active.subtitle}</p>
            )}
            <p className="font-semibold text-sm leading-tight">{active.title}</p>
            <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold mt-1">
              Open <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      )}
    </>
  );
}