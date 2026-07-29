import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  IGetRowsParams,
  IDatasource,
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

export function ServerPaginatedTable<TData>({
  columnDefs,
  fetchData,
  getRowId,
  onRowClicked,
  height = "100%",
  emptyMessage = "No rows to show",
  className,
  gridRef: externalGridRef,
}: ServerPaginatedTableProps<TData>) {
  const [mounted, setMounted] = useState(false);
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
        const showInitialOverlay = isFirstBlockRef.current && params.startRow === 0;

        if (showInitialOverlay) {
          apiRef.current?.showLoadingOverlay();
        }

        void fetchDataRef
          .current(params)
          .then(({ data, lastRow }) => {
            isFirstBlockRef.current = false;

            if (params.startRow === 0 && data.length === 0) {
              apiRef.current?.showNoRowsOverlay();
            } else {
              apiRef.current?.hideOverlay();
            }

            params.successCallback(data, lastRow);
          })
          .catch((error) => {
            isFirstBlockRef.current = false;
            apiRef.current?.hideOverlay();
            console.error("ServerPaginatedTable fetch failed:", error);
            params.failCallback();
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

  const overlayNoRowsTemplate = useMemo(
    () => `<span class="ag-overlay-no-rows-center">${emptyMessage}</span>`,
    [emptyMessage],
  );

  if (!mounted) {
    return (
      <div
        className={className ?? "ag-grid-guestcare flex items-center justify-center"}
        style={{ height }}
      >
        <span className="text-[13px] text-text-secondary">Loading table…</span>
      </div>
    );
  }

  return (
    <div className={className ?? "ag-grid-guestcare"} style={{ height }}>
      <AgGridProvider modules={AG_GRID_MODULES}>
        <AgGridReact<TData>
          ref={gridRef}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowModelType="infinite"
          cacheBlockSize={SERVER_TABLE_PAGE_SIZE}
          maxBlocksInCache={10}
          rowHeight={48}
          headerHeight={44}
          alwaysShowHorizontalScroll
          animateRows
          suppressCellFocus
          getRowId={getRowId ? (params) => getRowId({ data: params.data }) : undefined}
          overlayNoRowsTemplate={overlayNoRowsTemplate}
          overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading…</span>'
          onGridReady={onGridReady}
          onRowClicked={onRowClicked}
        />
      </AgGridProvider>
    </div>
  );
}

export { computeInfiniteScrollLastRow };
