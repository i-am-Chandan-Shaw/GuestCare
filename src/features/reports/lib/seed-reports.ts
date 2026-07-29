import { CUSTOMERS } from "@/data/mocks/customers.mock";
import { INCIDENT_LOGS } from "@/data/incidents";
import { findAgentByName, DEFAULT_AGENT_ID } from "@/data/agents.seed";
import { parseLegacyDisplayTimestamp, nowIso } from "@/shared/lib/datetime";
import { mapLegacyIncidentStatus } from "@/features/reports/lib/report-status";
import type { Report, ReportThreadEntry } from "@/shared/types/report";

function resolveCustomerId(propertyId?: string, customerId?: string): string {
  if (customerId) return customerId;
  if (!propertyId) return CUSTOMERS[0]?.id ?? "c1";
  return (
    CUSTOMERS.find((c) => c.propertyIds.includes(propertyId))?.id ?? CUSTOMERS[0]?.id ?? "c1"
  );
}

function resolveCustomerName(customerId: string): string {
  return CUSTOMERS.find((c) => c.id === customerId)?.name ?? "—";
}

function inferActionsFromNotes(callNotes: string): string[] {
  const actions: string[] = [];
  for (const line of callNotes.split("\n")) {
    const trimmed = line.replace(/^•\s*/, "").trim();
    if (
      trimmed.startsWith("Checked ") ||
      trimmed.startsWith("Reset ") ||
      trimmed.startsWith("Generated ") ||
      trimmed.startsWith("Called ") ||
      trimmed.startsWith("Shared ") ||
      trimmed.startsWith("Advised ")
    ) {
      const label = trimmed.split(".")[0]?.slice(0, 80);
      if (label) actions.push(label);
    }
  }
  return actions.slice(0, 5);
}

export function seedReportsFromIncidents(): { reports: Report[]; threads: ReportThreadEntry[] } {
  const reports: Report[] = [];
  const threads: ReportThreadEntry[] = [];

  INCIDENT_LOGS.forEach((log, index) => {
    const seq = String(index + 1).padStart(5, "0");
    const id = `RPT-2026-${seq}`;
    const agent = findAgentByName(log.agent) ?? findAgentByName("Priya Ramanathan")!;
    const customerId = resolveCustomerId(log.propertyId, log.customerId);
    const createdAt = parseLegacyDisplayTimestamp(log.timestamp);
    const status = mapLegacyIncidentStatus(log.status);
    const resolvedAt = status === "RESOLVED" ? createdAt : undefined;

    const report: Report = {
      id,
      issueName: log.issueSummary,
      issueType: log.incidentType,
      priority: log.priority ?? "P3",
      status,
      source: log.protocolIssueId ? "copilot" : "manual",
      customerId,
      propertyId: log.propertyId,
      assignedAgentId: agent.id,
      createdByAgentId: agent.id,
      callerName: log.callerName,
      callerContact: log.callerContact,
      reservationNumber: log.reservationNumber,
      nameOnBooking: log.nameOnBooking,
      callNotes: log.callNotes,
      actionsTaken: inferActionsFromNotes(log.callNotes),
      protocolIssueId: log.protocolIssueId,
      customerName: resolveCustomerName(customerId),
      propertyName: log.propertyLabel,
      assignedAgentName: agent.name,
      createdByAgentName: agent.name,
      createdAt,
      updatedAt: createdAt,
      lastActivityAt: createdAt,
      resolvedAt,
      version: 1,
    };

    reports.push(report);

    threads.push({
      id: `thr-${id}-create`,
      reportId: id,
      type: "system",
      authorAgentId: agent.id,
      authorAgentName: agent.name,
      body: "Report created",
      createdAt,
    });
  });

  return { reports, threads };
}

export function createEmptyReportStore(): { reports: Report[]; threads: ReportThreadEntry[] } {
  return seedReportsFromIncidents();
}

/** Fallback agent when name lookup fails */
export function getDefaultCreatorAgentId(): string {
  return DEFAULT_AGENT_ID;
}

export { nowIso };
