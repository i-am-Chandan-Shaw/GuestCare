import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IGetRowsParams, RowClickedEvent } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { getReportsPaginated } from "@/features/reports/api/reports.api";
import { createReportsTableColumnDefs } from "@/features/incidents/components/reports-table-columns";
import { ReportDetailPage } from "@/features/reports/components/ReportDetailPage";
import { useReportActor } from "@/features/reports/hooks/useReports";
import { REPORT_STATUS_LABELS } from "@/features/reports/lib/report-status";
import {
  ServerPaginatedTable,
  computeInfiniteScrollLastRow,
} from "@/components/table/ServerPaginatedTable";
import { SearchToolbar } from "@/shared/components/SearchToolbar";
import { cn } from "@/lib/utils";
import type { ReportListItem, ReportStatusFilter } from "@/shared/types/report";

const STATUS_FILTERS: { id: ReportStatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "OPEN", label: REPORT_STATUS_LABELS.OPEN },
  { id: "ESCALATED", label: REPORT_STATUS_LABELS.ESCALATED },
  { id: "HANDEDOVER", label: REPORT_STATUS_LABELS.HANDEDOVER },
  { id: "RESOLVED", label: REPORT_STATUS_LABELS.RESOLVED },
];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function IncidentReportsPage({
  customerId,
  reportId: reportIdFromSearch,
}: {
  customerId?: string;
  reportId?: string;
}) {
  const actor = useReportActor();
  const navigate = useNavigate({ from: "/reports" });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReportStatusFilter>("all");
  const debouncedSearch = useDebouncedValue(search, 300);
  const gridRef = useRef<AgGridReact<ReportListItem>>(null);
  const isMounted = useRef(false);

  const selectedReportId = reportIdFromSearch ?? null;

  const setSelectedReportId = useCallback(
    (nextId: string | null) => {
      void navigate({
        search: (prev) => ({
          ...prev,
          reportId: nextId ?? undefined,
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const handleViewReport = useCallback(
    (reportId: string) => {
      setSelectedReportId(reportId);
    },
    [setSelectedReportId],
  );

  const handleBack = useCallback(() => {
    setSelectedReportId(null);
  }, [setSelectedReportId]);

  const columnDefs = useMemo(
    () => createReportsTableColumnDefs({ onViewReport: handleViewReport }),
    [handleViewReport],
  );

  const handleFetchData = useCallback(
    async (params: IGetRowsParams) => {
      const startRow = params.startRow ?? 0;
      const limit = Math.max(1, (params.endRow ?? startRow + 50) - startRow);
      const page = Math.floor(startRow / limit) + 1;

      const result = await getReportsPaginated(
        {
          page,
          limit,
          search: debouncedSearch,
          status,
          customerId,
        },
        actor,
      );

      const lastRow = computeInfiniteScrollLastRow({
        startRow,
        rows: result.data,
        pageSize: limit,
        totalCountFromApi: result.pagination.total,
      });

      return { data: result.data, lastRow };
    },
    [actor, customerId, debouncedSearch, status],
  );

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    gridRef.current?.api?.purgeInfiniteCache();
  }, [debouncedSearch, status, customerId, actor.id]);

  const handleRowClick = useCallback(
    (event: RowClickedEvent<ReportListItem>) => {
      if (event.data?.id) setSelectedReportId(event.data.id);
    },
    [setSelectedReportId],
  );

  if (selectedReportId) {
    return <ReportDetailPage reportId={selectedReportId} onBack={handleBack} />;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border-color bg-white/80 px-5 py-4 backdrop-blur-xl">
        <h1 className="text-lg font-black uppercase tracking-tight text-text-primary">Reports</h1>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          {customerId
            ? "Reports for the selected customer"
            : "All logged reports across customers"}
        </p>

        {customerId && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] normal-case">
            <span className="font-normal text-text-secondary">Filtered to one customer.</span>
            <Link
              to="/"
              search={{ customerId }}
              className="font-medium text-brand-primary hover:underline"
            >
              Back to workspace
            </Link>
            <Link to="/reports" className="font-medium text-brand-primary hover:underline">
              View all reports
            </Link>
          </div>
        )}
      </div>

      <div className="shrink-0 bg-app-bg px-5 pt-3 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchToolbar
            layout="inline"
            className="w-full max-w-md"
            value={search}
            onChange={setSearch}
            placeholder="Search reports…"
            onClear={() => setSearch("")}
          />

          <div className="flex shrink-0 flex-wrap gap-2">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatus(item.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors",
                  status === item.id
                    ? "border-brand-primary/20 bg-brand-primary/10 text-brand-primary"
                    : "border-border-color bg-card-bg text-text-secondary hover:bg-app-bg",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg shadow-sm">
          <ServerPaginatedTable<ReportListItem>
            gridRef={gridRef}
            columnDefs={columnDefs}
            fetchData={handleFetchData}
            getRowId={({ data }) => data.id}
            onRowClicked={handleRowClick}
            emptyMessage="No reports match your filters."
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
