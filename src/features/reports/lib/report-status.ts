import type { IncidentStatus } from "@/shared/types";
import type { ReportStatus } from "@/shared/types/report";

export function mapLegacyIncidentStatus(status: IncidentStatus): ReportStatus {
  switch (status) {
    case "Resolved":
      return "RESOLVED";
    case "Unresolved - Escalation Handover":
      return "ESCALATED";
    case "PM Follow-up Needed":
      return "HANDEDOVER";
    case "In Progress":
    default:
      return "OPEN";
  }
}

export function mapReportStatusToLegacyIncidentStatus(status: ReportStatus): IncidentStatus {
  switch (status) {
    case "RESOLVED":
      return "Resolved";
    case "ESCALATED":
      return "Unresolved - Escalation Handover";
    case "HANDEDOVER":
      return "PM Follow-up Needed";
    case "OPEN":
    default:
      return "In Progress";
  }
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: "Open",
  ESCALATED: "Escalated",
  HANDEDOVER: "Handed over",
  RESOLVED: "Resolved",
};

export const REPORT_STATUS_TONES: Record<ReportStatus, "warning" | "danger" | "info" | "success"> =
  {
    OPEN: "warning",
    ESCALATED: "danger",
    HANDEDOVER: "info",
    RESOLVED: "success",
  };
