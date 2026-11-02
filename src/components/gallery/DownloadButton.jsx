import React from "react";
import { Download } from "lucide-react";

// Downloads the original media file straight from its existing URL (browser download, no proxy).
export default function DownloadButton({ url, filename, showLabel = false, className = "" }) {
  if (!url) return null;

  // Storage public URLs ignore the cross-origin `download` attribute; their `?download=`
  // param makes the same URL answer with Content-Disposition: attachment.
  const href = /^https?:\/\//i.test(url)
    ? `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(filename || "")}`
    : url;

  return (
    <a
      href={href}
      download={filename || ""}
      target="_blank"
      rel="noreferrer"
      title="Download"
      aria-label="Download"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-background/70 backdrop-blur text-primary hover:bg-primary hover:text-primary-foreground transition-colors ${className}`}
    >
      <Download className="w-3.5 h-3.5" />
      {showLabel && <span className="text-xs font-semibold uppercase tracking-wide">Download</span>}
    </a>
  );
}
