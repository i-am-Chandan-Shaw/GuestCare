import { Link } from "@tanstack/react-router";
import { useIncidentLogs } from "@/features/incidents/hooks/useIncidents";
import { HistoryListSkeleton } from "@/shared/components/ListSkeletons";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { formatTimelineTimestamp } from "@/shared/lib/format-relative-time";
import { isOpenIncident } from "@/shared/lib/incident-status";
import { cn } from "@/lib/utils";
import type { IncidentLog } from "@/shared/types";
import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, ChevronRight, History } from "lucide-react";

function HistoryItem({
  log,
  showPropertyLabel,
  customerId,
}: {
  log: IncidentLog;
  showPropertyLabel: boolean;
  customerId?: string;
}) {
  const isOpen = isOpenIncident(log);
  const reportSearch = {
    reportId: log.id,
    ...(customerId ? { customerId } : {}),
  };

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center">
        {isOpen ? (
          <CircleAlert className="h-6 w-6 fill-danger stroke-white" strokeWidth={2} />
        ) : (
          <CircleCheck className="h-6 w-6 fill-success stroke-white" strokeWidth={2} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex h-7 items-center justify-between gap-2">
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
        {showPropertyLabel && log.propertyLabel && (
          <p className="mt-0.5 truncate text-[12px] text-text-secondary">{log.propertyLabel}</p>
        )}
        {isOpen ? (
          <p className="mt-1 text-[11px] text-text-muted">Reported by {log.submittedBy}</p>
        ) : null}
        <Link
          to="/reports"
          search={reportSearch}
          className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-brand-primary transition-colors hover:text-brand-secondary"
        >
          View full report
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    </li>
  );
}

function HistoryBody({
  isLoading,
  isError,
  onRetry,
  emptyLabel,
  data,
  showPropertyLabel,
  customerId,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  emptyLabel: string;
  data: IncidentLog[] | undefined;
  showPropertyLabel: boolean;
  customerId?: string;
}) {
  if (isLoading) return <HistoryListSkeleton />;
  if (isError) return <QueryErrorState onRetry={onRetry} />;
  if (!data?.length) {
    return <p className="py-6 text-center text-[13px] text-card-subtext">{emptyLabel}</p>;
  }

  return (
    <ul className="relative">
      <span className="absolute bottom-3 left-[13px] top-3 z-0 w-px bg-border-color" aria-hidden />
      {data.map((log) => (
        <HistoryItem
          key={log.id}
          log={log}
          showPropertyLabel={showPropertyLabel}
          customerId={customerId}
        />
      ))}
    </ul>
  );
}

export function IssueHistoryPanel({
  customerId,
  propertyId,
  headerAction,
  className,
  emptyLabel = "No reports recorded.",
  variant = "panel",
}: {
  customerId?: string;
  propertyId?: string;
  headerAction?: ReactNode;
  className?: string;
  emptyLabel?: string;
  /** `panel` = sidebar card; `section` = lighter embedded card under suggestions */
  variant?: "panel" | "section";
}) {
  const filters = {
    ...(customerId ? { customerId } : {}),
    ...(propertyId ? { propertyId } : {}),
    limit: 20,
  };
  const { data, isLoading, isError, refetch } = useIncidentLogs(filters, {
    enabled: Boolean(customerId || propertyId),
  });

  const showPropertyLabel = !propertyId;
  const reportsSearch = customerId ? { customerId } : {};

  const header = (
    <div className="flex shrink-0 items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-text-secondary" strokeWidth={1.75} />
        <h2 className="text-[14px] font-bold text-text-primary">Report History</h2>
      </div>
      {headerAction}
    </div>
  );

  const footer = (
    <Link
      to="/reports"
      search={reportsSearch}
      className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-primary transition-colors hover:text-brand-secondary"
    >
      View all reports
      <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
    </Link>
  );

  if (variant === "section") {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card",
          className,
        )}
      >
        <div className="shrink-0 border-b border-border px-5 py-3">{header}</div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <HistoryBody
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            emptyLabel={emptyLabel}
            data={data}
            showPropertyLabel={showPropertyLabel}
            customerId={customerId}
          />
        </div>
        <div className="shrink-0 border-t border-border px-5 py-3">{footer}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg",
        className,
      )}
    >
      <div className="shrink-0 border-b border-border-color px-4 py-3">{header}</div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <HistoryBody
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          emptyLabel={emptyLabel}
          data={data}
          showPropertyLabel={showPropertyLabel}
          customerId={customerId}
        />
      </div>

      <div className="shrink-0 border-t border-border-color px-4 py-3">{footer}</div>
    </div>
  );
}
