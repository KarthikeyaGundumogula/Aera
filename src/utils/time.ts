/**
 * Formats an ISO date string into standard social media compact relative format.
 * e.g., "2h", "1d", "just now" (or "2h ago", "1d ago" when withSuffix is true).
 */
export function formatRelativeTime(isoString?: string, withSuffix = false): string {
  if (!isoString) return "just now";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "just now";
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const suffix = withSuffix ? " ago" : "";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m${suffix}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h${suffix}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d${suffix}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 52) {
    return `${diffInWeeks}w${suffix}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y${suffix}`;
}

/**
 * Formats a release date (e.g. "2015-10-05T00:00:00+00:00", "2015-10-05", "2024")
 * into a clean, human-readable display string like "Oct 5, 2015" or "2024".
 */
export function formatReleaseDate(rawDate?: string | null): string {
  if (!rawDate) return "";
  const trimmed = String(rawDate).trim();
  if (!trimmed || trimmed.startsWith("0000") || trimmed.startsWith("1970-01-01")) return "";

  // Pure 4-digit year format (e.g., "2024")
  if (/^\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) {
    return trimmed;
  }

  const year = d.getUTCFullYear();
  if (year <= 1900 || year >= 2100) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  } catch {
    return String(year);
  }
}

/**
 * Extracts a 4-digit release year string from any ISO date or year string.
 */
export function formatReleaseYear(rawDate?: string | null): string {
  if (!rawDate) return "";
  const trimmed = String(rawDate).trim();
  if (!trimmed || trimmed.startsWith("0000") || trimmed.startsWith("1970-01-01")) return "";

  const match = trimmed.match(/\b(19|20)\d{2}\b/);
  if (match) return match[0];

  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const y = d.getUTCFullYear();
    if (y > 1900 && y < 2100) return String(y);
  }
  return "";
}

