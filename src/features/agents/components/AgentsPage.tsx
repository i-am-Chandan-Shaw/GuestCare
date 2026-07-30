import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IGetRowsParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { Plus } from "lucide-react";
import { getAgentsPaginated } from "@/features/agents/api/agents.api";
import { AgentFormDialog } from "@/features/agents/components/AgentFormDialog";
import { createAgentsTableColumnDefs } from "@/features/agents/components/agents-table-columns";
import {
  canEditAgent,
  canManageAgents,
} from "@/features/agents/lib/agent-permissions";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toReportActor } from "@/features/reports/lib/report-scope";
import {
  ServerPaginatedTable,
  computeInfiniteScrollLastRow,
} from "@/components/table/ServerPaginatedTable";
import { Button } from "@/components/ui/Button";
import { SearchToolbar } from "@/shared/components/SearchToolbar";
import type { AgentListItem } from "@/shared/types/agent";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function AgentsPage() {
  const { agent } = useAuth();
  const actor = useMemo(() => toReportActor(agent), [agent]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const gridRef = useRef<AgGridReact<AgentListItem>>(null);
  const isMounted = useRef(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  const canManage = canManageAgents(actor);

  const openCreate = () => {
    setDialogMode("create");
    setEditingAgentId(null);
    setDialogOpen(true);
  };

  const openEdit = useCallback((agentId: string) => {
    setDialogMode("edit");
    setEditingAgentId(agentId);
    setDialogOpen(true);
  }, []);

  const columnDefs = useMemo(
    () =>
      createAgentsTableColumnDefs({
        canEdit: (row) => canEditAgent(actor, row),
        onEdit: openEdit,
      }),
    [actor, openEdit],
  );

  const handleFetchData = useCallback(
    async (params: IGetRowsParams) => {
      const startRow = params.startRow ?? 0;
      const limit = Math.max(1, (params.endRow ?? startRow + 50) - startRow);
      const page = Math.floor(startRow / limit) + 1;

      const result = await getAgentsPaginated({
        page,
        limit,
        search: debouncedSearch,
      });

      const lastRow = computeInfiniteScrollLastRow({
        startRow,
        rows: result.data,
        pageSize: limit,
        totalCountFromApi: result.pagination.total,
      });

      return { data: result.data, lastRow };
    },
    [debouncedSearch],
  );

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    gridRef.current?.api?.purgeInfiniteCache();
  }, [debouncedSearch]);

  const handleSaved = () => {
    gridRef.current?.api?.purgeInfiniteCache();
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border-color bg-white/80 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-black uppercase tracking-tight text-text-primary">
              Agents
            </h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Support team roster, roles, and customer scope
            </p>
          </div>
          {canManage ? (
            <Button type="button" onClick={openCreate} className="!h-9 shrink-0 !px-3">
              <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} />
              Add agent
            </Button>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 bg-app-bg px-5 pt-3 pb-4">
        <SearchToolbar
          layout="inline"
          className="w-full max-w-md"
          value={search}
          onChange={setSearch}
          placeholder="Search agents…"
          onClear={() => setSearch("")}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg shadow-sm">
          <ServerPaginatedTable<AgentListItem>
            gridRef={gridRef}
            columnDefs={columnDefs}
            fetchData={handleFetchData}
            getRowId={({ data }) => data.id}
            emptyMessage="No agents match your search."
            height="100%"
          />
        </div>
      </div>

      {canManage ? (
        <AgentFormDialog
          open={dialogOpen}
          mode={dialogMode}
          agentId={editingAgentId}
          actor={actor}
          onOpenChange={setDialogOpen}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
