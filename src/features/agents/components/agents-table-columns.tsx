import type { ColDef } from "ag-grid-community";
import type { ICellRendererParams } from "ag-grid-community";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatAgentRole } from "@/shared/lib/agent-display";
import { formatActivityTimestamp } from "@/shared/lib/datetime";
import type { AgentListItem } from "@/shared/types/agent";

function ActiveCell({ data }: ICellRendererParams<AgentListItem>) {
  if (!data) return null;
  return (
    <StatusChip tone={data.isActive ? "success" : "warning"}>
      {data.isActive ? "Active" : "Inactive"}
    </StatusChip>
  );
}

function RoleCell({ data }: ICellRendererParams<AgentListItem>) {
  if (!data) return null;
  return <span className="text-[13px] text-text-secondary">{formatAgentRole(data.role)}</span>;
}

function CreatedCell({ data }: ICellRendererParams<AgentListItem>) {
  if (!data) return null;
  return (
    <span className="tabular-nums text-text-secondary">
      {formatActivityTimestamp(data.createdAt)}
    </span>
  );
}

export const agentsTableColumnDefs: ColDef<AgentListItem>[] = [
  {
    headerName: "AGENT",
    field: "name",
    colId: "name",
    flex: 1,
    minWidth: 180,
  },
  {
    headerName: "EMAIL",
    field: "email",
    colId: "email",
    flex: 1,
    minWidth: 200,
  },
  {
    headerName: "ROLE",
    colId: "role",
    width: 120,
    minWidth: 100,
    cellRenderer: RoleCell,
    suppressSizeToFit: true,
  },
  {
    headerName: "STATUS",
    colId: "isActive",
    width: 110,
    minWidth: 110,
    cellRenderer: ActiveCell,
    suppressSizeToFit: true,
  },
  {
    headerName: "SCOPE",
    field: "customerScopeLabel",
    colId: "scope",
    flex: 1,
    minWidth: 140,
  },
  {
    headerName: "CREATED",
    colId: "createdAt",
    width: 180,
    minWidth: 180,
    cellRenderer: CreatedCell,
    suppressSizeToFit: true,
  },
];
