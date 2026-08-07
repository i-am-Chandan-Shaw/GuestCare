import type {
  Report,
  ReportAssignee,
  ReportListItem,
  ReportStatus,
  ReportThreadEntry,
  ReportThreadEntryType,
  ReportSource,
} from "@/shared/types/report";
import type { Priority } from "@/shared/types";
import { parsePriority } from "@/features/directory/lib/priority-from-category";
import {
  ensureAssignees,
  formatAssigneesLabel,
  syncDerivedAssigneeFields,
} from "@/features/reports/lib/report-assignees";

export type ReportRow = {
  id: string;
  display_id: string;
  issue_name: string;
  issue_type: string;
  priority: string;
  status: string;
  source: string;
  customer_id: string;
  property_id: string | null;
  protocol_id: string | null;
  created_by_agent_id: string;
  caller_name: string;
  caller_contact: string;
  reservation_number: string;
  name_on_booking: string;
  call_notes?: string | null;
  actions_taken?: unknown;
  customer_name: string;
  property_name: string;
  created_by_agent_name: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  resolved_at: string | null;
  version: number;
};

export type ReportAssigneeRow = {
  id: string;
  report_id: string;
  agent_id: string;
  agent_name: string;
  assigned_at: string;
  assigned_by_agent_id: string;
};

export type ReportThreadRow = {
  id: string;
  report_id: string;
  type: string;
  author_agent_id: string;
  author_agent_name: string;
  body: string | null;
  parent_id: string | null;
  metadata: unknown;
  created_at: string;
};

function mapActions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

function mapPriority(value: string): Priority {
  const parsed = parsePriority(value);
  if (!parsed) {
    throw new Error(`Invalid report priority: ${value}`);
  }
  return parsed;
}

function mapStatus(value: string): ReportStatus {
  if (
    value === "OPEN" ||
    value === "ESCALATED" ||
    value === "HANDEDOVER" ||
    value === "RESOLVED"
  ) {
    return value;
  }
  return "OPEN";
}

function mapSource(value: string): ReportSource {
  return value === "copilot" ? "copilot" : "manual";
}

export function mapAssigneeRow(row: ReportAssigneeRow): ReportAssignee {
  return {
    agentId: row.agent_id,
    agentName: row.agent_name,
    assignedAt: row.assigned_at,
    assignedByAgentId: row.assigned_by_agent_id,
  };
}

export function mapThreadRow(row: ReportThreadRow): ReportThreadEntry {
  return {
    id: row.id,
    reportId: row.report_id,
    type: row.type as ReportThreadEntryType,
    authorAgentId: row.author_agent_id,
    authorAgentName: row.author_agent_name,
    body: row.body ?? undefined,
    parentId: row.parent_id ?? undefined,
    metadata: (row.metadata as ReportThreadEntry["metadata"]) ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapReportRow(
  row: ReportRow,
  assignees: ReportAssignee[] = [],
): Report {
  const report: Report = {
    id: row.id,
    displayId: row.display_id,
    issueName: row.issue_name,
    issueType: row.issue_type,
    priority: mapPriority(row.priority),
    status: mapStatus(row.status),
    source: mapSource(row.source),
    customerId: row.customer_id,
    propertyId: row.property_id ?? undefined,
    assignedAgentId: assignees[0]?.agentId ?? row.created_by_agent_id,
    createdByAgentId: row.created_by_agent_id,
    callerName: row.caller_name,
    callerContact: row.caller_contact,
    reservationNumber: row.reservation_number,
    nameOnBooking: row.name_on_booking,
    callNotes: row.call_notes ?? "",
    actionsTaken: mapActions(row.actions_taken),
    protocolIssueId: row.protocol_id ?? undefined,
    customerName: row.customer_name,
    propertyName: row.property_name,
    assignedAgentName: formatAssigneesLabel(assignees),
    createdByAgentName: row.created_by_agent_name,
    assignees,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastActivityAt: row.last_activity_at,
    resolvedAt: row.resolved_at ?? undefined,
    version: row.version,
  };
  report.assignees = ensureAssignees(report);
  syncDerivedAssigneeFields(report);
  return report;
}

export function toReportListItem(report: Report, threadCount: number): ReportListItem {
  const assignees = ensureAssignees(report);
  return {
    id: report.id,
    displayId: report.displayId,
    issueName: report.issueName,
    issueType: report.issueType,
    priority: report.priority,
    status: report.status,
    propertyName: report.propertyName,
    customerName: report.customerName,
    assignedAgentName: formatAssigneesLabel(assignees),
    assignees,
    callerName: report.callerName,
    createdAt: report.createdAt,
    lastActivityAt: report.lastActivityAt,
    threadCount,
  };
}
