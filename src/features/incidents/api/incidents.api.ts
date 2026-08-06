import { z } from "zod";
import { createReport, getIncidentLogsFromReports } from "@/features/reports/api/reports.api";
import { reportToIncidentLog } from "@/features/reports/lib/report-legacy";
import { mapLegacyIncidentStatus } from "@/features/reports/lib/report-status";
import type {
  CreateIncidentInput,
  IncidentLog,
  IncidentLogFilters,
  IncidentStatus,
} from "@/shared/types";
import type { AgentAccess } from "@/shared/types/agent";

export type { CreateIncidentInput };

const createIncidentSchema = z.object({
  callerName: z.string(),
  callerContact: z.string(),
  reservation: z.string(),
  nameOnBooking: z.string(),
  incidentType: z.string().min(1, "Please select an issue type."),
  issueSummary: z.string().trim().min(1, "Please select or enter what the issue is."),
  actions: z.array(z.string()),
  priority: z.enum(["P1", "P2", "P3", "P4"]),
  status: z.string(),
  callNotes: z.string(),
  customerId: z.string().optional(),
  propertyId: z.string().optional(),
  propertyLabel: z.string().optional(),
  protocolIssueId: z.string().optional(),
  /** @deprecated Ignored — signed-in agent comes from session. */
  agentName: z.string().optional(),
  /** @deprecated Ignored — signed-in agent comes from session. */
  submittedBy: z.string().optional(),
});

function firstValidationMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please complete the required fields.";
}

export async function getIncidentLogs(filters: IncidentLogFilters = {}): Promise<IncidentLog[]> {
  return getIncidentLogsFromReports(filters);
}

export async function createIncident(
  input: CreateIncidentInput,
  _currentAgent?: AgentAccess,
): Promise<IncidentLog> {
  const parsed = createIncidentSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstValidationMessage(parsed.error));
  }

  const data = parsed.data;
  const customerId = data.customerId;
  if (!customerId) {
    throw new Error("A customer is required to create a report.");
  }

  const propertyId = data.propertyId?.trim() || undefined;
  const protocolIssueId = data.protocolIssueId?.trim() || undefined;

  const report = await createReport({
    issueName: data.issueSummary,
    issueType: data.incidentType,
    priority: data.priority,
    status: mapLegacyIncidentStatus(data.status as IncidentStatus),
    customerId,
    propertyId,
    callerName: data.callerName,
    callerContact: data.callerContact,
    reservationNumber: data.reservation,
    nameOnBooking: data.nameOnBooking,
    callNotes: data.callNotes,
    actionsTaken: data.actions,
    protocolIssueId,
    source: protocolIssueId ? "copilot" : "manual",
  });

  return reportToIncidentLog(report);
}
