import { cn } from "@/lib/utils";
import {
  REPORT_STATUS_LABELS,
  REPORT_STATUS_TONES,
} from "@/features/reports/lib/report-status";
import {
  formatActivityTimestamp,
  formatActivityTimestampRelative,
} from "@/shared/lib/datetime";
import type { ReportThreadEntry } from "@/shared/types/report";

function threadSummary(entry: ReportThreadEntry): string {
  switch (entry.type) {
    case "comment":
      return entry.body ?? "Comment";
    case "assignment": {
      const to = entry.metadata?.toAgentName ?? "another agent";
      return `assigned to ${to}`;
    }
    case "status_change": {
      const from = entry.metadata?.fromStatus
        ? REPORT_STATUS_LABELS[entry.metadata.fromStatus]
        : "—";
      const to = entry.metadata?.toStatus
        ? REPORT_STATUS_LABELS[entry.metadata.toStatus]
        : "—";
      return `changed status from ${from} to ${to}`;
    }
    case "field_edit":
      return `updated ${entry.metadata?.changedFields?.join(", ") ?? "fields"}`;
    case "system":
    default:
      return entry.body ?? "System event";
  }
}

export function ReportThread({ entries }: { entries: ReportThreadEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-[13px] text-text-secondary">No activity yet.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <li key={entry.id} className="relative pl-4">
          <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-brand-primary/60" />
          <div className="text-[13px] text-text-primary">
            <span className="font-semibold">{entry.authorAgentName}</span>
            <span className="text-text-secondary"> · {threadSummary(entry)}</span>
          </div>
          {entry.type === "comment" && entry.body && (
            <p className="mt-1 rounded-lg bg-app-bg px-3 py-2 text-[13px] text-text-primary">
              {entry.body}
            </p>
          )}
          <p
            className="mt-1 text-[11.5px] text-text-muted"
            title={formatActivityTimestamp(entry.createdAt)}
          >
            {formatActivityTimestampRelative(entry.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ReportStatusBadge({ status }: { status: keyof typeof REPORT_STATUS_LABELS }) {
  const tone = REPORT_STATUS_TONES[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        tone === "success" && "border-success/30 bg-success/10 text-success",
        tone === "warning" && "border-warning/30 bg-warning/10 text-warning",
        tone === "danger" && "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "info" && "border-info/30 bg-info/10 text-info",
      )}
    >
      {REPORT_STATUS_LABELS[status]}
    </span>
  );
}
