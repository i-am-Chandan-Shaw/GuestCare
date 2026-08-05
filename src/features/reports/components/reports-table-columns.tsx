import type { ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import { Eye } from "lucide-react";
import { StatusChip } from "@/components/ui/StatusChip";
import { priorityMeta } from "@/shared/constants/agent";
import { REPORT_STATUS_LABELS, REPORT_STATUS_TONES } from "@/features/reports/lib/report-status";
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
  const meta = priorityMeta[data.priority];
  return <StatusChip tone={meta.chipTone}>{meta.name}</StatusChip>;
}

function LoggedCell({ data }: ICellRendererParams<ReportListItem>) {
  if (!data) return null;
  return (
    <span className="tabular-nums" title={formatActivityTimestamp(data.createdAt)}>
      {formatActivityTimestamp(data.createdAt)}
    </span>
  );
}

function formatReportId(value: string | null | undefined) {
  return value?.replaceAll("-", "") ?? "";
}

function ActionsCell({
  data,
  onViewReport,
}: ICellRendererParams<ReportListItem> & { onViewReport: (id: string) => void }) {
  if (!data) return null;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onViewReport(data.id);
      }}
      aria-label="View report"
      title="View report"
      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-app-bg hover:text-brand-primary"
    >
      <Eye className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}

export function createReportsTableColumnDefs(options: {
  onViewReport: (reportId: string) => void;
}): ColDef<ReportListItem>[] {
  const { onViewReport } = options;

  return [
    {
      headerName: "REPORT ID",
      field: "id",
      colId: "reportId",
      width: 130,
      minWidth: 110,
      cellClass: "tabular-nums text-text-secondary",
      valueFormatter: (params: ValueFormatterParams<ReportListItem, string>) =>
        formatReportId(params.value),
      tooltipValueGetter: (params) => params.data?.id,
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
      width: 110,
      minWidth: 100,
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
      headerName: "MEMBERS",
      field: "assignedAgentName",
      colId: "agent",
      flex: 1,
      minWidth: 140,
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
    {
      headerName: "",
      colId: "actions",
      pinned: "right",
      lockPinned: true,
      width: 56,
      minWidth: 56,
      maxWidth: 56,
      sortable: false,
      resizable: false,
      suppressSizeToFit: true,
      cellClass: "flex items-center justify-center",
      cellRenderer: (params: ICellRendererParams<ReportListItem>) => (
        <ActionsCell {...params} onViewReport={onViewReport} />
      ),
    },
  ];
}
