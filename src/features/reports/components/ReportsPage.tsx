import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IGetRowsParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { getReportsPaginated } from "@/features/reports/api/reports.api";
import { createReportsTableColumnDefs } from "@/features/reports/components/reports-table-columns";
import { ReportDetailPage } from "@/features/reports/components/ReportDetailPage";
import { ReportsFiltersPopover } from "@/features/reports/components/ReportsFiltersPopover";
import { useAgentAccess } from "@/features/reports/hooks/useReports";
import {
  EMPTY_REPORTS_LIST_FILTERS,
  reportsListFiltersToQuery,
  type ReportsListFilters,
} from "@/features/reports/lib/reports-list-filters";
import {
  ServerPaginatedTable,
  computeInfiniteScrollLastRow,
} from "@/components/table/ServerPaginatedTable";
import { SearchToolbar } from "@/shared/components/SearchToolbar";
import type { ReportListItem } from "@/shared/types/report";

export function ReportsPage({
  customerId,
  reportId: reportIdFromSearch,
}: {
  customerId?: string;
  reportId?: string;
}) {
  const currentAgent = useAgentAccess();
  const navigate = useNavigate({ from: "/reports" });
  const [filters, setFilters] = useState<ReportsListFilters>(EMPTY_REPORTS_LIST_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const gridRef = useRef<AgGridReact<ReportListItem>>(null);
  const isMounted = useRef(false);

  const selectedReportId = reportIdFromSearch ?? null;

  const appliedFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

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
        reportsListFiltersToQuery(appliedFilters, { page, limit, customerId }),
        currentAgent,
      );

      const lastRow = computeInfiniteScrollLastRow({
        startRow,
        rows: result.data,
        pageSize: limit,
        totalCountFromApi: result.pagination.total,
      });

      return { data: result.data, lastRow };
    },
    [currentAgent, appliedFilters, customerId],
  );

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    gridRef.current?.api?.refreshInfiniteCache();
  }, [appliedFilters, customerId, currentAgent.id]);

  if (selectedReportId) {
    return <ReportDetailPage reportId={selectedReportId} onBack={handleBack} />;
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border-color bg-white/80 px-5 py-4 backdrop-blur-xl">
        <h1 className="text-lg font-black uppercase tracking-tight text-text-primary">Reports</h1>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          {customerId ? "Reports for the selected customer" : "All logged reports across customers"}
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
            value={filters.search}
            onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
            placeholder="Search reports…"
            onClear={() => setFilters((prev) => ({ ...prev, search: "" }))}
          />
          <ReportsFiltersPopover
            applied={filters}
            onApply={(next) =>
              setFilters((prev) => ({
                ...next,
                search: prev.search,
              }))
            }
            customerScoped={Boolean(customerId)}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg shadow-sm">
          <ServerPaginatedTable<ReportListItem>
            gridRef={gridRef}
            columnDefs={columnDefs}
            fetchData={handleFetchData}
            getRowId={({ data }) => data.id}
            emptyMessage="No reports match your filters."
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
