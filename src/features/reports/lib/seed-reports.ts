import { CUSTOMERS } from "@/data/mocks/customers.mock";
import { INCIDENT_LOGS } from "@/data/incidents";
import { DEFAULT_AGENT_ID } from "@/data/agents.seed";
import { findAgentByName } from "@/features/agents/lib/agent-store";
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
    const id = `GCR-2026-${seq}`;
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
      assignees: [
        {
          agentId: agent.id,
          agentName: agent.name,
          assignedAt: createdAt,
          assignedByAgentId: agent.id,
        },
      ],
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

    // Seed a sample conversation on the first few reports so nested UI is visible.
    if (index < 3) {
      const rootId = `thr-${id}-c1`;
      const rootCreated = new Date(new Date(createdAt).getTime() + 30 * 60_000).toISOString();
      const reply1Created = new Date(new Date(createdAt).getTime() + 90 * 60_000).toISOString();
      const reply2Created = new Date(new Date(createdAt).getTime() + 150 * 60_000).toISOString();
      const otherAgent = findAgentByName("James Okonkwo") ?? findAgentByName("Sara Chen")!;

      threads.push({
        id: rootId,
        reportId: id,
        type: "comment",
        authorAgentId: agent.id,
        authorAgentName: agent.name,
        body: "Logged the guest call and started the standard checklist for this issue.",
        createdAt: rootCreated,
      });
      threads.push({
        id: `thr-${id}-c1-r1`,
        reportId: id,
        type: "comment",
        parentId: rootId,
        authorAgentId: otherAgent.id,
        authorAgentName: otherAgent.name,
        body: "Checked property notes — spare parts / access details look current. Happy to take next steps if needed.",
        createdAt: reply1Created,
      });
      threads.push({
        id: `thr-${id}-c1-r2`,
        reportId: id,
        type: "comment",
        parentId: rootId,
        authorAgentId: agent.id,
        authorAgentName: agent.name,
        body: "Guest confirmed the temporary workaround. Leaving this open until we get final confirmation.",
        createdAt: reply2Created,
      });

      if (index === 0) {
        const root2Id = `thr-${id}-c2`;
        const root2Created = new Date(new Date(createdAt).getTime() + 200 * 60_000).toISOString();
        threads.push({
          id: root2Id,
          reportId: id,
          type: "comment",
          authorAgentId: otherAgent.id,
          authorAgentName: otherAgent.name,
          body: "Following up — any update from the host on ETA for a permanent fix?",
          createdAt: root2Created,
        });
      }
    }
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
