import type { IsoDateTime } from "@/shared/types/agent";

const DISPLAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

export function nowIso(): IsoDateTime {
  return new Date().toISOString();
}

export function formatActivityTimestamp(iso: IsoDateTime): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", DISPLAY_FORMAT);
}

export function formatActivityTimestampRelative(iso: IsoDateTime, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return formatActivityTimestamp(iso);
}

/** Parse legacy seed strings like "27 Jul 2026, 21:14:02" → ISO UTC */
export function parseLegacyDisplayTimestamp(value: string): IsoDateTime {
  const parsed = Date.parse(value.replace(",", ""));
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }
  return nowIso();
}
