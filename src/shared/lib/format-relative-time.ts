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

/** Compact badge label e.g. "1D", "3H", "Now". */
export function formatCompactRelativeTime(timestamp: string): string {
  const date = parseIncidentTimestamp(timestamp);
  if (!date) return timestamp;

  const diffMs = Date.now() - date.getTime();
  if (diffMs < MINUTE) return "Now";
  if (diffMs < HOUR) return `${Math.floor(diffMs / MINUTE)}M`;
  if (diffMs < DAY) return `${Math.floor(diffMs / HOUR)}H`;
  const days = Math.floor(diffMs / DAY);
  if (days < 14) return `${days}D`;
  if (days < 60) return `${Math.floor(days / 7)}W`;
  return timestamp.split(",")[0] ?? timestamp;
}

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Timeline label e.g. "Today • 10:15 AM" or "27 Apr 2025 • 9:45 AM". */
export function formatTimelineTimestamp(timestamp: string): string {
  const date = parseIncidentTimestamp(timestamp);
  if (!date) return timestamp;

  const timePart = TIME_FORMATTER.format(date);
  const todayStart = startOfDay(new Date());
  const dateStart = startOfDay(date);
  const dayDiff = Math.round((todayStart - dateStart) / DAY);

  if (dayDiff === 0) return `Today • ${timePart}`;
  if (dayDiff === 1) return `Yesterday • ${timePart}`;
  return `${DATE_FORMATTER.format(date)} • ${timePart}`;
}
