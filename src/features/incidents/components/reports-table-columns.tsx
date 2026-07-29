import type { ICellRendererParams } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { StatusChip } from "@/components/ui/StatusChip";
import { priorityMeta } from "@/shared/constants/agent";
import {
  REPORT_STATUS_LABELS,
  REPORT_STATUS_TONES,
} from "@/features/reports/lib/report-status";
import { formatActivityTimestamp } from "@/shared/lib/datetime";
import type { ReportListItem } from "@/shared/types/report";

function StatusCell({ data }: ICellRendererParams<ReportListItem>) {
  if (!data) return null;
  return (
    <StatusChip tone={REPORT_STATUS_TONES[data.status]}>
      {REPORT_STATUS_LABELS[data.status]}
    </StatusChip>
  );
}

function IssueCell({ data }: ICellRendererParams<ReportListItem>) {
  if (!data) return null;
  return (
    <div className="flex min-w-0 flex-col justify-center py-1">
      <p className="truncate text-[13px] text-text-primary">{data.issueName}</p>
      <p className="truncate text-[13px] text-text-secondary">{data.issueType}</p>
    </div>
  );
}

function PriorityCell({ data }: ICellRendererParams<ReportListItem>) {
  if (!data?.priority) return null;
  return (
    <span className="text-[13px] text-text-secondary">{priorityMeta[data.priority].label}</span>
  );
}

function LoggedCell({ data }: ICellRendererParams<ReportListItem>) {
  if (!data) return null;
  return (
    <span className="tabular-nums" title={formatActivityTimestamp(data.createdAt)}>
      {formatActivityTimestamp(data.createdAt)}
    </span>
  );
}

export const reportsTableColumnDefs: ColDef<ReportListItem>[] = [
  {
    headerName: "REPORT ID",
    field: "id",
    colId: "reportId",
    width: 140,
    minWidth: 120,
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
    headerName: "CUSTOMER",
    field: "customerName",
    colId: "customer",
    flex: 1,
    minWidth: 120,
  },
  {
    headerName: "PROPERTY",
    field: "propertyName",
    colId: "property",
    flex: 1,
    minWidth: 140,
  },
  {
    headerName: "AGENT",
    field: "assignedAgentName",
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
    colId: "logged",
    width: 180,
    minWidth: 180,
    cellRenderer: LoggedCell,
    suppressSizeToFit: true,
  },
  {
    headerName: "STATUS",
    colId: "status",
    width: 120,
    minWidth: 120,
    cellRenderer: StatusCell,
    suppressSizeToFit: true,
  },
];
