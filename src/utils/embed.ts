/**
 * Embed Utilities — Single source of truth for constructing embed URLs
 * and thumbnails from a platform + srcId pair.
 *
 * The backend sends only { platform, srcId }. All URL construction happens
 * here so no full URLs are stored in mock data or API responses.
 */

export type EmbedPlatform = "youtube" | "twitter";

// ─── URL Builders ────────────────────────────────────────────────────────────

/**
 * Build the embeddable iframe src for a given platform and srcId.
 * - YouTube: https://www.youtube.com/embed/{id}?enablejsapi=1
 * - Twitter: https://twitter.com/i/web/status/{id}  (canonical tweet URL for blockquote)
 */
export function buildEmbedUrl(platform: EmbedPlatform, srcId: string): string {
  if (!srcId) return "";
  const cleanId = extractSrcId(platform, srcId) || srcId.trim();
  switch (platform) {
    case "youtube":
      return `https://www.youtube.com/embed/${cleanId}?enablejsapi=1`;
    case "twitter":
      return `https://twitter.com/i/web/status/${cleanId}`;
    default:
      return "";
  }
}

/**
 * Build the preview thumbnail URL for a given platform and srcId.
 * Note: YouTube maxresdefault.jpg depends on the upload quality; 
 * use getYoutubeFallbackThumbnail() if the primary URL 404s.
 */
export function buildThumbnail(platform: EmbedPlatform, srcId: string): string {
  switch (platform) {
    case "youtube":
      return `https://img.youtube.com/vi/${srcId}/maxresdefault.jpg`;
    case "twitter":
      // Twitter has no reliable public thumbnail — callers should use a fallback
      return "";
    default:
      return "";
  }
}

/**
 * Returns a high-quality fallback (640x480) for YouTube videos that
 * do not have a max-resolution thumbnail.
 */
export function getYoutubeFallbackThumbnail(srcId: string): string {
  return `https://img.youtube.com/vi/${srcId}/hqdefault.jpg`;
}

// ─── Extraction (Upload flow only — extracts srcId from a pasted URL) ────────

/**
 * Extract the srcId from a full URL pasted by the user during the upload flow.
 * Returns null if the URL does not match the expected pattern.
 *
 * YouTube patterns supported:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *
 * Twitter patterns supported:
 *   https://twitter.com/[user]/status/TWEET_ID
 *   https://x.com/[user]/status/TWEET_ID
 */
export function extractSrcId(
  platform: EmbedPlatform | string,
  url: string
): string {
  if (!url) return "";
  const trimmed = url.trim();
  const plat = (platform || "youtube").toString().toLowerCase();

  if (plat === "youtube" || plat === "edit") {
    const match = trimmed.match(
      /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:v\/|e\/|embed\/|watch\?v=|shorts\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (match?.[1]) return match[1];

    const matchV = trimmed.match(/[?&]v=([^&]+)/);
    if (matchV) return matchV[1].split("&")[0];

    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

    const last = (trimmed.split("/").pop() || "").split("?")[0];
    if (last.length === 11) return last;
    return trimmed;
  }

  if (plat === "twitter") {
    const match = trimmed.match(/^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    if (match?.[1]) return match[1];
    if (/^\d+$/.test(trimmed)) return trimmed;
    const last = (trimmed.split("/").pop() || "").split("?")[0];
    return last || trimmed;
  }

  return trimmed;
}
