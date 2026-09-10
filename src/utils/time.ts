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
