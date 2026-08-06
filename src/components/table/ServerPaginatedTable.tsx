import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  IGetRowsParams,
  IDatasource,
  CellClickedEvent,
  RowClickedEvent,
} from "ag-grid-community";
import { AG_GRID_MODULES } from "@/lib/ag-grid-setup";
import { computeInfiniteScrollLastRow } from "@/components/table/computeInfiniteScrollLastRow";

export const SERVER_TABLE_PAGE_SIZE = 50;

export type ServerTableFetchResult<TData> = {
  data: TData[];
  lastRow: number;
};

export type ServerTableFetchData<TData> = (
  params: IGetRowsParams,
) => Promise<ServerTableFetchResult<TData>>;

export type ServerPaginatedTableProps<TData> = {
  columnDefs: ColDef<TData>[];
  fetchData: ServerTableFetchData<TData>;
  getRowId?: (params: { data: TData }) => string;
  onRowClicked?: (event: RowClickedEvent<TData>) => void;
  onCellClicked?: (event: CellClickedEvent<TData>) => void;
  height?: string;
  emptyMessage?: string;
  className?: string;
  gridRef?: React.RefObject<AgGridReact<TData> | null>;
};

const defaultColDef: ColDef = {
  sortable: false,
  filter: false,
  resizable: true,
  suppressHeaderMenuButton: true,
};

function TableSkeleton({ className, height }: { className?: string; height?: string }) {
  return (
    <div className={className} style={{ height }}>
      <div className="h-11 border-b border-border-color bg-app-bg/40" />
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="flex h-12 items-center gap-3 border-b border-border-color/50 px-4"
        >
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-border-color/70" />
          <div className="h-3 min-w-0 flex-1 animate-pulse rounded bg-border-color/60" />
          <div className="hidden h-3 w-32 animate-pulse rounded bg-border-color/50 sm:block" />
          <div className="h-3 w-16 animate-pulse rounded bg-border-color/40" />
        </div>
      ))}
    </div>
  );
}

export function ServerPaginatedTable<TData>({
  columnDefs,
  fetchData,
  getRowId,
  onRowClicked,
  onCellClicked,
  height = "100%",
  emptyMessage = "No rows to show",
  className,
  gridRef: externalGridRef,
}: ServerPaginatedTableProps<TData>) {
  const [mounted, setMounted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const internalGridRef = useRef<AgGridReact<TData>>(null);
  const gridRef = externalGridRef ?? internalGridRef;
  const fetchDataRef = useRef(fetchData);
  const isFirstBlockRef = useRef(true);
  const apiRef = useRef<GridApi<TData> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  const datasource = useMemo<IDatasource>(
    () => ({
      getRows: (params: IGetRowsParams) => {
        void fetchDataRef
          .current(params)
          .then(({ data, lastRow }) => {
            const isFirst = isFirstBlockRef.current && params.startRow === 0;
            isFirstBlockRef.current = false;

            if (params.startRow === 0 && data.length === 0) {
              apiRef.current?.showNoRowsOverlay();
            } else {
              apiRef.current?.hideOverlay();
            }

            params.successCallback(data, lastRow);
            if (isFirst) setInitialLoading(false);
          })
          .catch((error) => {
            const isFirst = isFirstBlockRef.current && params.startRow === 0;
            isFirstBlockRef.current = false;
            apiRef.current?.hideOverlay();
            console.error("ServerPaginatedTable fetch failed:", error);
            params.failCallback();
            if (isFirst) setInitialLoading(false);
          });
      },
    }),
    [],
  );

  const onGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      apiRef.current = event.api;
      event.api.setGridOption("datasource", datasource);
    },
    [datasource],
  );

  const overlayNoRowsTemplate = useMemo(() => {
    const safe = emptyMessage
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    return `<span class="ag-overlay-no-rows-center">${safe}</span>`;
  }, [emptyMessage]);

  const rootClass = className ?? "ag-grid-guestcare";

  if (!mounted) {
    return <TableSkeleton className={rootClass} height={height} />;
  }

  return (
    <div className={`relative ${rootClass}`} style={{ height }}>
      {initialLoading ? (
        <TableSkeleton className="absolute inset-0 z-10 bg-card-bg" height="100%" />
      ) : null}
      <div className={initialLoading ? "invisible h-full" : "h-full"}>
        <AgGridProvider modules={AG_GRID_MODULES}>
          <AgGridReact<TData>
            ref={gridRef}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowModelType="infinite"
            cacheBlockSize={SERVER_TABLE_PAGE_SIZE}
            rowHeight={48}
            headerHeight={44}
            alwaysShowHorizontalScroll
            animateRows
            suppressCellFocus
            getRowId={getRowId ? (params) => getRowId({ data: params.data }) : undefined}
            overlayNoRowsTemplate={overlayNoRowsTemplate}
            onGridReady={onGridReady}
            onRowClicked={onRowClicked}
            onCellClicked={onCellClicked}
          />
        </AgGridProvider>
      </div>
    </div>
  );
}

export { computeInfiniteScrollLastRow };
