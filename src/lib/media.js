// Shared media-type detection for gallery/advert items: an explicit media_type wins,
// otherwise fall back to the file extension on the URL.
export const isVideoMedia = (url, mediaType) =>
  mediaType === "video" || /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || "");

// Filename to suggest when a member downloads an item: the item title plus the file's own extension.
export const mediaFileName = (title, url) => {
  const ext = /\.([a-z0-9]{2,5})(?:\?|#|$)/i.exec(url || "")?.[1]?.toLowerCase();
  const base = String(title || "")
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return `${base || "srfits-media"}${ext ? `.${ext}` : ""}`;
};
