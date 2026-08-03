import { z } from "zod";
import { CUSTOMERS } from "@/data/mocks/customers.mock";
import {
  __getReportStoreSnapshot,
  createReport,
} from "@/features/reports/api/reports.api";
import { reportToIncidentLog } from "@/features/reports/lib/report-legacy";
import { mapLegacyIncidentStatus } from "@/features/reports/lib/report-status";
import type {
  CreateIncidentInput,
  IncidentLog,
  IncidentLogFilters,
  IncidentStatus,
} from "@/shared/types";
import type { ReportActor } from "@/shared/types/agent";

const createIncidentSchema = z.object({
  callerName: z.string(),
  callerContact: z.string(),
  reservation: z.string(),
  nameOnBooking: z.string(),
  incidentType: z.string(),
  issueSummary: z.string().min(1),
  actions: z.array(z.string()),
  priority: z.enum(["P1", "P2", "P3", "P4"]),
  status: z.string(),
  callNotes: z.string(),
  customerId: z.string().optional(),
  propertyId: z.string().optional(),
  propertyLabel: z.string().optional(),
  protocolIssueId: z.string().optional(),
  /** @deprecated Ignored — actor comes from session. */
  agentName: z.string().optional(),
  /** @deprecated Ignored — actor comes from session. */
  submittedBy: z.string().optional(),
});

function resolveCustomerIdForProperty(propertyId?: string): string | undefined {
  if (!propertyId) return undefined;
  return CUSTOMERS.find((c) => c.propertyIds.includes(propertyId))?.id;
}

function getIncidentLogsFromStore(filters: IncidentLogFilters = {}): IncidentLog[] {
  let reports = __getReportStoreSnapshot();

  if (filters.customerId) {
    const propertyIds = new Set(
      CUSTOMERS.find((c) => c.id === filters.customerId)?.propertyIds ?? [],
    );
    reports = reports.filter(
      (r) =>
        r.customerId === filters.customerId ||
        (r.propertyId && propertyIds.has(r.propertyId)),
    );
  }

  if (filters.propertyId) {
    reports = reports.filter((r) => r.propertyId === filters.propertyId);
  }

  if (filters.protocolIssueId) {
    reports = reports.filter((r) => r.protocolIssueId === filters.protocolIssueId);
  }

  reports.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  let logs = reports.map(reportToIncidentLog);

  if (filters.limit) {
    logs = logs.slice(0, filters.limit);
  }

  return logs;
}

export async function getIncidentLogs(filters: IncidentLogFilters = {}): Promise<IncidentLog[]> {
  return getIncidentLogsFromStore(filters);
}

export async function createIncident(
  input: CreateIncidentInput,
  actor: ReportActor,
): Promise<IncidentLog> {
  const parsed = createIncidentSchema.parse(input);

  const customerId =
    parsed.customerId ?? resolveCustomerIdForProperty(parsed.propertyId);
  if (!customerId) {
    throw new Error("A customer is required to create an incident.");
  }

  const report = await createReport(
    {
      issueName: parsed.issueSummary,
      issueType: parsed.incidentType,
      priority: parsed.priority,
      status: mapLegacyIncidentStatus(parsed.status as IncidentStatus),
      customerId,
      propertyId: parsed.propertyId,
      callerName: parsed.callerName,
      callerContact: parsed.callerContact,
      reservationNumber: parsed.reservation,
      nameOnBooking: parsed.nameOnBooking,
      callNotes: parsed.callNotes,
      actionsTaken: parsed.actions,
      protocolIssueId: parsed.protocolIssueId,
      source: parsed.protocolIssueId ? "copilot" : "manual",
    },
    actor,
  );

  return reportToIncidentLog(report);
}
