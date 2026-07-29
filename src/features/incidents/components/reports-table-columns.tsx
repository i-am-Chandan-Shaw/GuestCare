import type { ICellRendererParams } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { StatusChip } from "@/components/ui/StatusChip";
import { priorityMeta } from "@/shared/constants/agent";
import type { IncidentLog } from "@/shared/types";

function StatusCell({ data }: ICellRendererParams<IncidentLog>) {
  if (!data) return null;
  const isResolved = data.status === "Resolved";
  return (
    <StatusChip tone={isResolved ? "success" : "warning"}>
      {isResolved ? "Done" : "Open"}
    </StatusChip>
  );
}

function IssueCell({ data }: ICellRendererParams<IncidentLog>) {
  if (!data) return null;
  return (
    <div className="flex min-w-0 flex-col justify-center py-1">
      <p className="truncate text-[13px] text-text-primary">{data.issueSummary}</p>
      <p className="truncate text-[13px] text-text-secondary">{data.incidentType}</p>
    </div>
  );
}

function PriorityCell({ data }: ICellRendererParams<IncidentLog>) {
  if (!data?.priority) return null;
  return (
    <span className="text-[13px] text-text-secondary">{priorityMeta[data.priority].label}</span>
  );
}

export const reportsTableColumnDefs: ColDef<IncidentLog>[] = [
  {
    headerName: "REPORT ID",
    field: "id",
    colId: "reportId",
    width: 120,
    minWidth: 100,
    cellClass: "tabular-nums text-text-secondary",
    suppressSizeToFit: true,
  },
  {
    headerName: "ISSUE",
    colId: "issue",
    flex: 1,
    minWidth: 200,
    cellRenderer: IssueCell,
    autoHeight: false,
    wrapText: false,
  },
  {
    headerName: "PRIORITY",
    colId: "priority",
    width: 130,
    minWidth: 130,
    cellRenderer: PriorityCell,
    suppressSizeToFit: true,
  },
  {
    headerName: "PROPERTY",
    field: "propertyLabel",
    colId: "property",
    flex: 1,
    minWidth: 140,
  },
  {
    headerName: "AGENT",
    field: "agent",
    colId: "agent",
    flex: 1,
    minWidth: 120,
  },
  {
    headerName: "CALLER",
    field: "callerName",
    colId: "caller",
    flex: 1,
    minWidth: 120,
  },
  {
    headerName: "LOGGED",
    field: "timestamp",
    colId: "logged",
    width: 180,
    minWidth: 180,
    cellClass: "tabular-nums",
    suppressSizeToFit: true,
  },
  {
    headerName: "STATUS",
    colId: "status",
    width: 110,
    minWidth: 110,
    cellRenderer: StatusCell,
    suppressSizeToFit: true,
  },
];
