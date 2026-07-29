import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { StatusChip } from "@/components/ui/StatusChip";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { AgentProfile } from "@/shared/types";

function NameCell({ data }: ICellRendererParams<AgentProfile>) {
  const { agent: sessionAgent } = useAuth();
  if (!data) return null;

  const isCurrent = data.id === sessionAgent.id;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="truncate text-[13px] font-semibold text-text-primary">{data.name}</span>
      {isCurrent && <StatusChip tone="brand">You</StatusChip>}
    </div>
  );
}

export const agentsTableColumnDefs: ColDef<AgentProfile>[] = [
  {
    headerName: "AGENT",
    colId: "name",
    flex: 1,
    minWidth: 180,
    cellRenderer: NameCell,
  },
  {
    headerName: "HANDLE",
    field: "handle",
    colId: "handle",
    flex: 1,
    minWidth: 120,
    cellClass: "font-mono text-[13px] text-text-secondary",
  },
  {
    headerName: "ROLE",
    field: "role",
    colId: "role",
    flex: 1,
    minWidth: 160,
  },
  {
    headerName: "SHIFT",
    field: "shift",
    colId: "shift",
    flex: 1,
    minWidth: 160,
    cellClass: "tabular-nums",
  },
];
