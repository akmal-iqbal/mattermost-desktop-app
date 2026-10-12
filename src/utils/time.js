/**
 * Relative timestamps for thread replies ("just now" / "4 minutes ago").
 * Backend: server returns ISO times — convert to ts and reuse.
 */
export function relativeTime(ts, fallback = "") {
  if (!ts) return fallback;
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s} seconds ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return m === 1 ? "1 minute ago" : `${m} minutes ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? "1 hour ago" : `${h} hours ago`;
  return fallback;
}
