import { formatActivityTimestamp } from "@/shared/lib/datetime";
import { formatAssigneesLabel, ensureAssignees } from "@/features/reports/lib/report-assignees";
import { mapReportStatusToLegacyIncidentStatus } from "@/features/reports/lib/report-status";
import type { IncidentLog, IncidentType } from "@/shared/types";
import type { Report } from "@/shared/types/report";

export function reportToIncidentLog(report: Report): IncidentLog {
  return {
    id: report.id,
    callerName: report.callerName,
    callerContact: report.callerContact,
    reservationNumber: report.reservationNumber,
    nameOnBooking: report.nameOnBooking,
    propertyLabel: report.propertyName,
    propertyId: report.propertyId,
    customerId: report.customerId,
    incidentType: report.issueType as IncidentType,
    issueSummary: report.issueName,
    protocolIssueId: report.protocolIssueId,
    status: mapReportStatusToLegacyIncidentStatus(report.status),
    callNotes: report.callNotes,
    agent: formatAssigneesLabel(ensureAssignees(report)),
    submittedBy: report.createdByAgentName,
    timestamp: formatActivityTimestamp(report.createdAt),
    priority: report.priority,
  };
}
