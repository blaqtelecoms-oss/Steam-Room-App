// Shared media-type detection for gallery/advert items: an explicit media_type wins,
// otherwise fall back to the file extension on the URL.
export const isVideoMedia = (url, mediaType) =>
  mediaType === "video" || /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || "");
