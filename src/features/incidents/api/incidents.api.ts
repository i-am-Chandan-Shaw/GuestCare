import { z } from "zod";
import { CUSTOMERS } from "@/data/mock";
import { INCIDENT_LOGS as SEED_INCIDENT_LOGS } from "@/data/incidents";
import { filterIncidentReports } from "@/features/incidents/lib/filter-incident-reports";
import type {
  CreateIncidentInput,
  IncidentLog,
  IncidentLogFilters,
  IncidentLogsQuery,
  PaginatedIncidentLogs,
} from "@/shared/types";

const incidentStore: IncidentLog[] = SEED_INCIDENT_LOGS.map((log) => ({
  ...log,
  customerId: log.customerId ?? resolveCustomerIdForProperty(log.propertyId),
}));

function resolveCustomerIdForProperty(propertyId?: string): string | undefined {
  if (!propertyId) return undefined;
  return CUSTOMERS.find((c) => c.propertyIds.includes(propertyId))?.id;
}

import { isOpenIncident } from "@/shared/lib/incident-status";
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

export async function getIncidentLogs(filters: IncidentLogFilters = {}): Promise<IncidentLog[]> {
  let results = [...incidentStore];

  if (filters.customerId) {
    const propertyIds = new Set(
      CUSTOMERS.find((c) => c.id === filters.customerId)?.propertyIds ?? [],
    );
    results = results.filter(
      (log) =>
        log.customerId === filters.customerId ||
        (log.propertyId && propertyIds.has(log.propertyId)),
    );
  }

  if (filters.propertyId) {
    results = results.filter((log) => log.propertyId === filters.propertyId);
  }

  if (filters.protocolIssueId) {
    results = results.filter((log) => log.protocolIssueId === filters.protocolIssueId);
  }

  results.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  if (filters.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

export async function getIncidentLogsPaginated(
  query: IncidentLogsQuery,
): Promise<PaginatedIncidentLogs> {
  const { page, limit, search = "", status = "all", customerId } = query;

  let results = [...incidentStore];

  if (customerId) {
    const propertyIds = new Set(
      CUSTOMERS.find((c) => c.id === customerId)?.propertyIds ?? [],
    );
    results = results.filter(
      (log) =>
        log.customerId === customerId ||
        (log.propertyId && propertyIds.has(log.propertyId)),
    );
  }

  results.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  results = filterIncidentReports(results, search, status);

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * limit;
  const data = results.slice(start, start + limit);

  return {
    data,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

export async function countOpenIncidents(filters: IncidentLogFilters = {}): Promise<number> {
  const logs = await getIncidentLogs(filters);
  return logs.filter(isOpenIncident).length;
}

export async function createIncident(input: CreateIncidentInput): Promise<IncidentLog> {
  const parsed = createIncidentSchema.parse(input);
  const timestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const entry: IncidentLog = {
    id: `inc-${Date.now()}`,
    callerName: parsed.callerName,
    callerContact: parsed.callerContact,
    reservationNumber: parsed.reservation,
    nameOnBooking: parsed.nameOnBooking,
    propertyLabel: parsed.propertyLabel ?? "—",
    propertyId: parsed.propertyId,
    customerId: parsed.customerId ?? resolveCustomerIdForProperty(parsed.propertyId),
    incidentType: parsed.incidentType as IncidentLog["incidentType"],
    issueSummary: parsed.issueSummary,
    protocolIssueId: parsed.protocolIssueId,
    status: parsed.status as IncidentLog["status"],
    callNotes: parsed.callNotes,
    agent: parsed.agentName,
    submittedBy: parsed.submittedBy,
    timestamp,
    priority: parsed.priority,
  };

  incidentStore.unshift(entry);
  return entry;
}
