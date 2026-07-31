import { useMemo } from "react";
import {
  CheckCircle2,
  Info,
  Pencil,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { threadSummary } from "@/features/reports/components/ReportThread";
import {
  formatActivityTimestamp,
  formatActivityTimestampRelative,
} from "@/shared/lib/datetime";
import type { ReportThreadEntry } from "@/shared/types/report";

const EVENT_ICON: Record<
  Exclude<ReportThreadEntry["type"], "comment">,
  { icon: LucideIcon; tone: string }
> = {
  status_change: {
    icon: CheckCircle2,
    tone: "bg-success/10 text-success",
  },
  assignment: {
    icon: UserPlus,
    tone: "bg-sky-500/10 text-sky-600",
  },
  field_edit: {
    icon: Pencil,
    tone: "bg-amber-500/10 text-amber-600",
  },
  system: {
    icon: Info,
    tone: "bg-brand-primary/10 text-brand-primary",
  },
};

function eventVisual(entry: ReportThreadEntry) {
  if (entry.type === "assignment" && entry.metadata?.action === "removed") {
    return {
      icon: UserMinus,
      tone: "bg-rose-500/10 text-rose-600",
    };
  }
  if (entry.type === "comment") {
    return EVENT_ICON.system;
  }
  return EVENT_ICON[entry.type] ?? EVENT_ICON.system;
}

export function ReportActivityTimeline({
  entries,
}: {
  entries: ReportThreadEntry[];
}) {
  const activity = useMemo(
    () =>
      entries
        .filter((e) => e.type !== "comment")
        .toSorted(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [entries],
  );

  return (
    <section className="rounded-xl border border-border-color bg-card-bg p-5 sm:p-6 shadow-sm">
      <h3 className="mb-5 text-[14px] font-bold text-text-primary">Activity</h3>

      {activity.length === 0 ? (
        <p className="text-[13px] text-text-muted">No activity yet.</p>
      ) : (
        <ol className="relative space-y-0">
          {activity.map((entry, index) => {
            const { icon: Icon, tone } = eventVisual(entry);
            const isLast = index === activity.length - 1;
            return (
              <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
                {!isLast ? (
                  <span
                    className="absolute left-[15px] top-8 bottom-0 w-px bg-border-color"
                    aria-hidden
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-[1] inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    tone,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[13px] leading-snug text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      {entry.authorAgentName}
                    </span>{" "}
                    {threadSummary(entry)}
                  </p>
                  <p
                    className="mt-1 text-[11px] text-text-muted"
                    title={formatActivityTimestamp(entry.createdAt)}
                  >
                    {formatActivityTimestampRelative(entry.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
