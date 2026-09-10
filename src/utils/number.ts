/**
 * Formats a numeric value into a compact human-readable string (e.g. 1.2K, 3.4M).
 */
export function formatStat(num: number): string {
  if (isNaN(num) || num === 0) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}
