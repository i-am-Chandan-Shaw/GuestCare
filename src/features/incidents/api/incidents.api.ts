import { z } from "zod";
import { CUSTOMERS } from "@/data/mock";
import { findAgentByName, DEFAULT_AGENT_ID, findAgentById } from "@/data/agents.seed";
import {
  __getReportStoreSnapshot,
  createReport,
  getReportsPaginated,
} from "@/features/reports/api/reports.api";
import { reportToIncidentLog } from "@/features/reports/lib/report-legacy";
import { mapLegacyIncidentStatus } from "@/features/reports/lib/report-status";
import { toReportActor } from "@/features/reports/lib/report-scope";
import type {
  CreateIncidentInput,
  IncidentLog,
  IncidentLogFilters,
  IncidentLogsQuery,
  IncidentStatus,
  PaginatedIncidentLogs,
} from "@/shared/types";

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
  agentName: z.string().min(1),
  submittedBy: z.string().min(1),
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

export async function getIncidentLogsPaginated(
  query: IncidentLogsQuery,
): Promise<PaginatedIncidentLogs> {
  const { page, limit, search = "", status = "all", customerId } = query;

  const reportStatus =
    status === "open"
      ? ("OPEN" as const)
      : status === "resolved"
        ? ("RESOLVED" as const)
        : status === "all"
          ? "all"
          : undefined;

  const result = await getReportsPaginated({
    page,
    limit,
    search,
    statuses:
      reportStatus === "OPEN" || reportStatus === "RESOLVED" ? [reportStatus] : undefined,
    customerId,
  });

  if (status === "open") {
    const filtered = result.data.filter((r) => r.status !== "RESOLVED");
    return {
      data: filtered.map((item) =>
        reportToIncidentLog(__getReportStoreSnapshot().find((r) => r.id === item.id)!),
      ),
      pagination: {
        ...result.pagination,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      },
    };
  }

  return {
    data: result.data.map((item) =>
      reportToIncidentLog(__getReportStoreSnapshot().find((r) => r.id === item.id)!),
    ),
    pagination: result.pagination,
  };
}

export async function countOpenIncidents(filters: IncidentLogFilters = {}): Promise<number> {
  const logs = await getIncidentLogs(filters);
  return logs.filter((log) => log.status !== "Resolved").length;
}

export async function createIncident(input: CreateIncidentInput): Promise<IncidentLog> {
  const parsed = createIncidentSchema.parse(input);
  const agent =
    findAgentByName(parsed.agentName) ?? findAgentById(DEFAULT_AGENT_ID)!;
  const actor = toReportActor(agent);

  const report = await createReport(
    {
      issueName: parsed.issueSummary,
      issueType: parsed.incidentType,
      priority: parsed.priority,
      status: mapLegacyIncidentStatus(parsed.status as IncidentStatus),
      customerId: parsed.customerId ?? resolveCustomerIdForProperty(parsed.propertyId) ?? CUSTOMERS[0]!.id,
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
