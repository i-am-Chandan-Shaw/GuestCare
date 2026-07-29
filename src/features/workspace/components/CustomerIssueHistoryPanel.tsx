import { Link } from "@tanstack/react-router";
import { useIncidentLogs } from "@/features/incidents/hooks/useIncidents";
import { LoadingState } from "@/shared/components/LoadingState";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { formatTimelineTimestamp } from "@/shared/lib/format-relative-time";
import { isOpenIncident } from "@/shared/lib/incident-status";
import { cn } from "@/lib/utils";
import type { IncidentLog } from "@/shared/types";
import { Check, ChevronRight, History } from "lucide-react";

function HistoryItem({ log }: { log: IncidentLog }) {
  const isOpen = isOpenIncident(log);

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full text-white",
            isOpen ? "bg-danger" : "bg-success",
          )}
        >
          {isOpen ? (
            <span className="text-[11px] font-black leading-none">!</span>
          ) : (
            <Check className="h-3 w-3" strokeWidth={3} />
          )}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex h-6 items-center justify-between gap-2">
          <p className="text-[11px] font-medium leading-none text-text-muted">
            {formatTimelineTimestamp(log.timestamp)}
          </p>
          <span
            className={cn(
              "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              isOpen
                ? "border-danger/20 bg-danger/10 text-danger"
                : "border-success/20 bg-success/10 text-success",
            )}
          >
            {isOpen ? "Open" : "Resolved"}
          </span>
        </div>
        <h3 className="mt-1 text-[13px] font-semibold leading-snug text-text-primary">
          {log.issueSummary}
        </h3>
        {log.propertyLabel && (
          <p className="mt-0.5 truncate text-[12px] text-text-secondary">{log.propertyLabel}</p>
        )}
        <p className="mt-1 text-[11px] text-text-muted">
          {isOpen ? `Reported by ${log.submittedBy}` : `Resolved by ${log.agent}`}
        </p>
      </div>
    </li>
  );
}

export function CustomerIssueHistoryPanel({ customerId }: { customerId: string }) {
  const { data, isLoading, isError, refetch } = useIncidentLogs({
    customerId,
    limit: 20,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg">
      <div className="flex shrink-0 items-center gap-2 border-b border-border-color px-4 py-3">
        <History className="h-4 w-4 text-text-secondary" strokeWidth={1.75} />
        <h2 className="text-[14px] font-bold text-text-primary">Issue History</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <LoadingState label="Loading history…" />
        ) : isError ? (
          <QueryErrorState onRetry={() => refetch()} />
        ) : !data?.length ? (
          <p className="py-8 text-center text-[13px] text-card-subtext">
            No issues recorded for this customer.
          </p>
        ) : (
          <ul className="relative">
            <span
              className="absolute bottom-3 left-[11px] top-3 z-0 w-px bg-border-color"
              aria-hidden
            />
            {data.map((log) => (
              <HistoryItem key={log.id} log={log} />
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-border-color px-4 py-3">
        <Link
          to="/reports"
          search={{ customerId }}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-primary transition-colors hover:text-brand-secondary"
        >
          View all issues
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
