import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Pencil } from "lucide-react";
import { StatusChip } from "@/components/ui/StatusChip";
import { Avatar } from "@/shared/components/Avatar";
import { formatAgentRole } from "@/shared/lib/agent-display";
import { formatActivityTimestamp } from "@/shared/lib/datetime";
import type { AgentListItem } from "@/shared/types/agent";

function AgentNameCell({ data }: ICellRendererParams<AgentListItem>) {
  if (!data) return null;
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar name={data.name} seed={data.id} src={data.imageUrl} size="md" />
      <span className="truncate text-[13px] font-medium text-text-primary">{data.name}</span>
    </span>
  );
}

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

function EditCell({
  data,
  canEdit,
  onEdit,
}: ICellRendererParams<AgentListItem> & {
  canEdit: (agent: AgentListItem) => boolean;
  onEdit: (agent: AgentListItem) => void;
}) {
  if (!data || !canEdit(data)) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(data);
      }}
      aria-label={`Edit ${data.name}`}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-app-bg hover:text-text-primary"
    >
      <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}

export function createAgentsTableColumnDefs({
  canEdit,
  onEdit,
}: {
  canEdit: (agent: AgentListItem) => boolean;
  onEdit: (agent: AgentListItem) => void;
}): ColDef<AgentListItem>[] {
  return [
    {
      headerName: "AGENT",
      field: "name",
      colId: "name",
      flex: 1,
      minWidth: 200,
      cellRenderer: AgentNameCell,
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
    {
      headerName: "",
      colId: "actions",
      width: 56,
      minWidth: 56,
      maxWidth: 56,
      sortable: false,
      filter: false,
      suppressSizeToFit: true,
      cellRenderer: EditCell,
      cellRendererParams: { canEdit, onEdit },
    },
  ];
}
