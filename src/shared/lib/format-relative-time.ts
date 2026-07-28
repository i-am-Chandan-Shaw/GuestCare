const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/** Parses en-GB mock timestamps like "28 Jul 2026, 14:32:05" for relative display. */
function parseIncidentTimestamp(timestamp: string): Date | null {
  const parsed = Date.parse(timestamp.replace(/(\d{2} \w{3} \d{4}),/, "$1"));
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

export function formatRelativeTime(timestamp: string): string {
  const date = parseIncidentTimestamp(timestamp);
  if (!date) return timestamp;

  const diffMs = Date.now() - date.getTime();
  if (diffMs < MINUTE) return "Just now";
  if (diffMs < HOUR) {
    const mins = Math.floor(diffMs / MINUTE);
    return `${mins} min ago`;
  }
  if (diffMs < DAY) {
    const hours = Math.floor(diffMs / HOUR);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  const days = Math.floor(diffMs / DAY);
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return timestamp.split(",")[0] ?? timestamp;
}
