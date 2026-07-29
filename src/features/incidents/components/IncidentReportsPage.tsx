import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useIncidentLogs } from "@/features/incidents/hooks/useIncidents";
import { ReportRow } from "@/features/incidents/components/ReportRow";
import {
  filterIncidentReports,
  type ReportStatusFilter,
} from "@/features/incidents/lib/filter-incident-reports";
import { LoadingState } from "@/shared/components/LoadingState";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SearchToolbar } from "@/shared/components/SearchToolbar";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { id: ReportStatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
];

export function IncidentReportsPage({ customerId }: { customerId?: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReportStatusFilter>("all");
  const filters = useMemo(() => ({ customerId }), [customerId]);
  const { data, isLoading, isError, refetch } = useIncidentLogs(filters);

  const filtered = useMemo(
    () => filterIncidentReports(data ?? [], search, status),
    [data, search, status],
  );

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto p-6">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">Reports</h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          {customerId
            ? "Incidents for the selected customer."
            : "All logged incidents across customers."}
        </p>
      </div>

      {customerId && (
        <div className="flex items-center justify-between gap-3 rounded-sm border border-border/60 bg-muted/20 px-4 py-2.5">
          <p className="text-[13px] text-muted-foreground">Showing reports for one customer.</p>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              search={{ customerId }}
              className="text-[13px] font-medium text-primary hover:underline"
            >
              Back to workspace
            </Link>
            <Link to="/reports" className="text-[13px] font-medium text-primary hover:underline">
              View all reports
            </Link>
          </div>
        </div>
      )}

      <SearchToolbar
        value={search}
        onChange={setSearch}
        placeholder="Search reports…"
        onClear={() => setSearch("")}
        resultLabel={
          search.trim() || status !== "all"
            ? `Showing ${filtered.length} of ${data?.length ?? 0} reports`
            : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStatus(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
              status === item.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/60 bg-card text-muted-foreground hover:bg-muted/30",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState label="Loading reports…" />}
      {isError && <QueryErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <div className="flex w-full flex-col gap-2">
          {filtered.map((log) => (
            <ReportRow key={log.id} log={log} />
          ))}
          {filtered.length === 0 && (
            <p className="rounded-sm border border-dashed border-border bg-card p-10 text-center text-[13px] text-muted-foreground">
              No reports match your filters.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
