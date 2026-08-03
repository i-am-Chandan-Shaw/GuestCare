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
  incidentType: z.string().min(1, "Please select an issue type."),
  issueSummary: z
    .string()
    .trim()
    .min(1, "Please select or enter what the issue is."),
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

function firstValidationMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please complete the required fields.";
}

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
  const parsed = createIncidentSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstValidationMessage(parsed.error));
  }

  const data = parsed.data;
  const customerId =
    data.customerId ?? resolveCustomerIdForProperty(data.propertyId);
  if (!customerId) {
    throw new Error("A customer is required to create a report.");
  }

  const report = await createReport(
    {
      issueName: data.issueSummary,
      issueType: data.incidentType,
      priority: data.priority,
      status: mapLegacyIncidentStatus(data.status as IncidentStatus),
      customerId,
      propertyId: data.propertyId,
      callerName: data.callerName,
      callerContact: data.callerContact,
      reservationNumber: data.reservation,
      nameOnBooking: data.nameOnBooking,
      callNotes: data.callNotes,
      actionsTaken: data.actions,
      protocolIssueId: data.protocolIssueId,
      source: data.protocolIssueId ? "copilot" : "manual",
    },
    actor,
  );

  return reportToIncidentLog(report);
}
