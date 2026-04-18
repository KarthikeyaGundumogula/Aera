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
  switch (platform) {
    case "youtube":
      return `https://www.youtube.com/embed/${srcId}?enablejsapi=1`;
    case "twitter":
      // Twitter oEmbed / widgets.js uses canonical status URL
      return `https://twitter.com/i/web/status/${srcId}`;
    default:
      return "";
  }
}

/**
 * Build the preview thumbnail URL for a given platform and srcId.
 * Falls back to hqdefault if maxresdefault is unavailable (handled via onError in <img>).
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
  platform: EmbedPlatform,
  url: string
): string | null {
  if (!url) return null;

  switch (platform) {
    case "youtube": {
      // Hardened regex for YouTube to handle watch?, embed/, shorts/, youtu.be, and additional params
      const match = url.match(
        /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:v\/|e\/|embed\/|watch\?v=|shorts\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      return match?.[1] ?? null;
    }
    case "twitter": {
      // Robust regex for Twitter/X status links
      const match = url.match(/^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
      return match?.[1] ?? null;
    }
    default:
      return null;
  }
}
