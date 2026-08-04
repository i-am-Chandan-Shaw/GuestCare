import { CUSTOMERS } from "@/mock-data/mocks/customers.mock";
import { PROPERTIES } from "@/mock-data/properties";
import { listAgents, findAgentById } from "@/features/agents/lib/agent-store";
import {
  ensureAssignees,
  formatAssigneesLabel,
  syncDerivedAssigneeFields,
} from "@/features/reports/lib/report-assignees";
import { createEmptyReportStore } from "@/features/reports/lib/seed-reports";
import {
  agentCanAccessCustomer,
  agentCanAssignReport,
  agentCanEditReport,
  filterReportsByActor,
} from "@/features/reports/lib/report-scope";
import { nowIso } from "@/shared/lib/datetime";
import type { ReportActor } from "@/shared/types/agent";
import type {
  AddReportAssigneeInput,
  AddReportCommentInput,
  AssignReportInput,
  CreateReportInput,
  PaginatedReports,
  RemoveReportAssigneeInput,
  Report,
  ReportDetail,
  ReportListItem,
  ReportsQuery,
  ReportStatus,
  ReportThreadEntry,
  UpdateReportCommentInput,
  UpdateReportInput,
} from "@/shared/types/report";

const store = createEmptyReportStore();
const reportStore: Report[] = store.reports;
const threadStore: ReportThreadEntry[] = store.threads;
let reportIdCounter = reportStore.length + 1;

function resolveCustomerName(customerId: string): string {
  return CUSTOMERS.find((c) => c.id === customerId)?.name ?? "—";
}

function resolvePropertyName(propertyId?: string, fallback = "—"): string {
  if (!propertyId) return fallback;
  return PROPERTIES.find((p) => p.id === propertyId)?.name ?? fallback;
}

function touchReport(
  report: Report,
  threadEntry?: Omit<ReportThreadEntry, "createdAt"> & { createdAt?: string },
): ReportThreadEntry | undefined {
  const now = nowIso();
  report.updatedAt = now;
  report.lastActivityAt = now;

  if (report.status === "RESOLVED" && !report.resolvedAt) {
    report.resolvedAt = now;
  } else if (report.status !== "RESOLVED") {
    report.resolvedAt = undefined;
  }

  if (!threadEntry) return undefined;

  const entry: ReportThreadEntry = {
    ...threadEntry,
    createdAt: threadEntry.createdAt ?? now,
  };
  threadStore.push(entry);
  report.lastActivityAt = entry.createdAt;
  return entry;
}

function toListItem(report: Report): ReportListItem {
  const threadCount = threadStore.filter((t) => t.reportId === report.id).length;
  const assignees = ensureAssignees(report);
  return {
    id: report.id,
    issueName: report.issueName,
    issueType: report.issueType,
    priority: report.priority,
    status: report.status,
    propertyName: report.propertyName,
    customerName: report.customerName,
    assignedAgentName: formatAssigneesLabel(assignees),
    callerName: report.callerName,
    createdAt: report.createdAt,
    lastActivityAt: report.lastActivityAt,
    threadCount,
  };
}

function activityDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function filterReports(query: ReportsQuery, actor?: ReportActor): Report[] {
  let results = filterReportsByActor([...reportStore], actor);

  if (query.customerId) {
    const propertyIds = new Set(
      CUSTOMERS.find((c) => c.id === query.customerId)?.propertyIds ?? [],
    );
    results = results.filter(
      (r) => r.customerId === query.customerId || (r.propertyId && propertyIds.has(r.propertyId)),
    );
  } else if (query.customerIds && query.customerIds.length > 0) {
    const allowed = new Set(query.customerIds);
    const propertyIds = new Set(
      query.customerIds.flatMap((id) => CUSTOMERS.find((c) => c.id === id)?.propertyIds ?? []),
    );
    results = results.filter(
      (r) => allowed.has(r.customerId) || (r.propertyId != null && propertyIds.has(r.propertyId)),
    );
  }

  if (query.statuses && query.statuses.length > 0) {
    const allowed = new Set(query.statuses);
    results = results.filter((r) => allowed.has(r.status));
  }

  if (query.priorities && query.priorities.length > 0) {
    const allowed = new Set(query.priorities);
    results = results.filter((r) => allowed.has(r.priority));
  }

  if (query.assignedAgentIds && query.assignedAgentIds.length > 0) {
    const allowed = new Set(query.assignedAgentIds);
    results = results.filter((r) => ensureAssignees(r).some((a) => allowed.has(a.agentId)));
  }

  if (query.propertyIds && query.propertyIds.length > 0) {
    const allowed = new Set(query.propertyIds);
    results = results.filter((r) => r.propertyId != null && allowed.has(r.propertyId));
  }

  if (query.issueTypes && query.issueTypes.length > 0) {
    const allowed = new Set(query.issueTypes);
    results = results.filter((r) => allowed.has(r.issueType));
  }

  if (query.dateFrom) {
    const from = query.dateFrom;
    results = results.filter((r) => activityDateKey(r.lastActivityAt) >= from);
  }

  if (query.dateTo) {
    const to = query.dateTo;
    results = results.filter((r) => activityDateKey(r.lastActivityAt) <= to);
  }

  const search = query.search?.trim().toLowerCase();
  if (search) {
    results = results.filter((r) => {
      const haystack = [
        r.id,
        r.issueName,
        r.issueType,
        r.callerName,
        r.callerContact,
        r.reservationNumber,
        r.nameOnBooking,
        r.propertyName,
        r.customerName,
        r.callNotes,
        formatAssigneesLabel(ensureAssignees(r)),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  results.sort((a, b) => (a.lastActivityAt < b.lastActivityAt ? 1 : -1));
  return results;
}

function nextReportId(): string {
  const id = `GCR-2026-${String(reportIdCounter).padStart(5, "0")}`;
  reportIdCounter += 1;
  return id;
}

export async function getReportsPaginated(
  query: ReportsQuery,
  actor?: ReportActor,
): Promise<PaginatedReports> {
  const { page, limit } = query;
  const filtered = filterReports(query, actor);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * limit;
  const data = filtered.slice(start, start + limit).map(toListItem);

  return {
    data,
    pagination: { page: safePage, limit, total, totalPages },
  };
}

export async function getReportById(id: string, actor?: ReportActor): Promise<ReportDetail | null> {
  const report = reportStore.find((r) => r.id === id);
  if (!report) return null;
  if (actor && !filterReportsByActor([report], actor).length) return null;

  report.assignees = ensureAssignees(report);
  syncDerivedAssigneeFields(report);

  const thread = threadStore
    .filter((t) => t.reportId === id)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

  return { report: { ...report, assignees: [...report.assignees] }, thread };
}

export async function createReport(input: CreateReportInput, actor: ReportActor): Promise<Report> {
  if (!agentCanAccessCustomer(actor, input.customerId)) {
    throw new Error("Not allowed to create a report for this customer");
  }

  const now = nowIso();
  const id = nextReportId();
  const status: ReportStatus = input.status ?? "OPEN";
  const customerName = resolveCustomerName(input.customerId);
  const propertyName = resolvePropertyName(input.propertyId);

  const report: Report = {
    id,
    issueName: input.issueName,
    issueType: input.issueType,
    priority: input.priority,
    status,
    source: input.source ?? "manual",
    customerId: input.customerId,
    propertyId: input.propertyId,
    assignedAgentId: actor.id,
    createdByAgentId: actor.id,
    callerName: input.callerName,
    callerContact: input.callerContact,
    reservationNumber: input.reservationNumber,
    nameOnBooking: input.nameOnBooking,
    callNotes: input.callNotes,
    actionsTaken: input.actionsTaken,
    protocolIssueId: input.protocolIssueId,
    customerName,
    propertyName,
    assignedAgentName: actor.name,
    createdByAgentName: actor.name,
    assignees: [
      {
        agentId: actor.id,
        agentName: actor.name,
        assignedAt: now,
        assignedByAgentId: actor.id,
      },
    ],
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    resolvedAt: status === "RESOLVED" ? now : undefined,
    version: 1,
  };

  reportStore.unshift(report);
  touchReport(report, {
    id: `thr-${id}-create`,
    reportId: id,
    type: "system",
    authorAgentId: actor.id,
    authorAgentName: actor.name,
    body: "Report created and assigned to you",
  });

  return report;
}

export async function updateReport(
  id: string,
  input: UpdateReportInput,
  actor: ReportActor,
): Promise<Report> {
  const report = reportStore.find((r) => r.id === id);
  if (!report) throw new Error("Report not found");
  if (!agentCanEditReport(actor, report)) {
    throw new Error("Not allowed to update this report");
  }
  if (input.version !== report.version) throw new Error("Report was updated by someone else");

  const previousStatus = report.status;
  const changedFields: string[] = [];

  const assign = <K extends keyof Report>(field: K, value: Report[K] | undefined) => {
    if (value !== undefined && report[field] !== value) {
      changedFields.push(field);
      report[field] = value;
    }
  };

  assign("issueName", input.issueName);
  assign("issueType", input.issueType);
  assign("priority", input.priority);
  assign("callerName", input.callerName);
  assign("callerContact", input.callerContact);
  assign("reservationNumber", input.reservationNumber);
  assign("nameOnBooking", input.nameOnBooking);
  assign("callNotes", input.callNotes);
  assign("actionsTaken", input.actionsTaken);
  assign("protocolIssueId", input.protocolIssueId);

  if (input.customerId) {
    assign("customerId", input.customerId);
    report.customerName = resolveCustomerName(input.customerId);
  }
  if (input.propertyId !== undefined) {
    assign("propertyId", input.propertyId);
    report.propertyName = resolvePropertyName(input.propertyId);
  }

  const statusChanged = input.status !== undefined && input.status !== previousStatus;

  if (statusChanged) {
    report.status = input.status!;
    if (report.status === "RESOLVED") {
      report.resolvedAt = nowIso();
    } else if (previousStatus === "RESOLVED") {
      report.resolvedAt = undefined;
    }
  }

  const editFields = changedFields.filter((f) => f !== "status");

  if (statusChanged) {
    touchReport(report, {
      id: `thr-${id}-status-${Date.now()}`,
      reportId: id,
      type: "status_change",
      authorAgentId: actor.id,
      authorAgentName: actor.name,
      metadata: { fromStatus: previousStatus, toStatus: input.status! },
    });
  } else if (editFields.length > 0) {
    touchReport(report, {
      id: `thr-${id}-edit-${Date.now()}`,
      reportId: id,
      type: "field_edit",
      authorAgentId: actor.id,
      authorAgentName: actor.name,
      metadata: { changedFields: editFields },
    });
  } else {
    touchReport(report);
  }

  report.version += 1;
  return report;
}

export async function addReportAssignee(
  id: string,
  input: AddReportAssigneeInput,
  actor: ReportActor,
): Promise<Report> {
  const report = reportStore.find((r) => r.id === id);
  if (!report) throw new Error("Report not found");
  if (!agentCanAssignReport(actor, report)) {
    throw new Error("Not allowed to assign agents on this report");
  }

  const agent = findAgentById(input.agentId);
  if (!agent) throw new Error("Agent not found");

  report.assignees = ensureAssignees(report);
  if (report.assignees.some((a) => a.agentId === agent.id)) {
    return report;
  }

  const now = nowIso();
  report.assignees.push({
    agentId: agent.id,
    agentName: agent.name,
    assignedAt: now,
    assignedByAgentId: actor.id,
  });
  syncDerivedAssigneeFields(report);

  touchReport(report, {
    id: `thr-${id}-assign-add-${Date.now()}`,
    reportId: id,
    type: "assignment",
    authorAgentId: actor.id,
    authorAgentName: actor.name,
    body: input.note,
    metadata: {
      action: "added",
      toAgentId: agent.id,
      toAgentName: agent.name,
    },
  });

  report.version += 1;
  return report;
}

export async function removeReportAssignee(
  id: string,
  input: RemoveReportAssigneeInput,
  actor: ReportActor,
): Promise<Report> {
  const report = reportStore.find((r) => r.id === id);
  if (!report) throw new Error("Report not found");
  if (!agentCanAssignReport(actor, report)) {
    throw new Error("Not allowed to assign agents on this report");
  }

  report.assignees = ensureAssignees(report);
  const existing = report.assignees.find((a) => a.agentId === input.agentId);
  if (!existing) return report;

  report.assignees = report.assignees.filter((a) => a.agentId !== input.agentId);
  syncDerivedAssigneeFields(report);

  touchReport(report, {
    id: `thr-${id}-assign-remove-${Date.now()}`,
    reportId: id,
    type: "assignment",
    authorAgentId: actor.id,
    authorAgentName: actor.name,
    metadata: {
      action: "removed",
      toAgentId: existing.agentId,
      toAgentName: existing.agentName,
    },
  });

  report.version += 1;
  return report;
}

/** @deprecated Prefer addReportAssignee / removeReportAssignee. Replaces members with a single agent. */
export async function assignReport(
  id: string,
  input: AssignReportInput,
  actor: ReportActor,
): Promise<Report> {
  const report = reportStore.find((r) => r.id === id);
  if (!report) throw new Error("Report not found");
  if (!agentCanAssignReport(actor, report)) {
    throw new Error("Not allowed to assign agents on this report");
  }

  const toAgent = findAgentById(input.toAgentId);
  if (!toAgent) throw new Error("Agent not found");

  const previous = ensureAssignees(report);
  const fromAgentId = previous[0]?.agentId;
  const fromAgentName = previous[0]?.agentName;
  const now = nowIso();

  report.assignees = [
    {
      agentId: toAgent.id,
      agentName: toAgent.name,
      assignedAt: now,
      assignedByAgentId: actor.id,
    },
  ];
  syncDerivedAssigneeFields(report);

  touchReport(report, {
    id: `thr-${id}-assign-${Date.now()}`,
    reportId: id,
    type: "assignment",
    authorAgentId: actor.id,
    authorAgentName: actor.name,
    body: input.note,
    metadata: {
      action: "added",
      fromAgentId,
      fromAgentName,
      toAgentId: toAgent.id,
      toAgentName: toAgent.name,
    },
  });

  report.version += 1;
  return report;
}

export async function addReportComment(
  id: string,
  input: AddReportCommentInput,
  actor: ReportActor,
): Promise<ReportThreadEntry> {
  const report = reportStore.find((r) => r.id === id);
  if (!report) throw new Error("Report not found");
  if (!filterReportsByActor([report], actor).length) {
    throw new Error("Not allowed to comment on this report");
  }

  const body = input.body.trim();
  if (!body) throw new Error("Comment body is required");

  let parentId: string | undefined;
  if (input.parentId) {
    const parent = threadStore.find(
      (t) => t.id === input.parentId && t.reportId === id && t.type === "comment",
    );
    if (!parent) throw new Error("Parent comment not found");
    if (parent.parentId) throw new Error("Cannot reply to a thread reply");
    parentId = parent.id;
  }

  const entry = touchReport(report, {
    id: `thr-${id}-comment-${Date.now()}`,
    reportId: id,
    type: "comment",
    authorAgentId: actor.id,
    authorAgentName: actor.name,
    body,
    parentId,
  });

  report.version += 1;
  return entry!;
}

export async function updateReportComment(
  reportId: string,
  commentId: string,
  input: UpdateReportCommentInput,
  actor: ReportActor,
): Promise<ReportThreadEntry> {
  const report = reportStore.find((r) => r.id === reportId);
  if (!report) throw new Error("Report not found");
  if (actor && !filterReportsByActor([report], actor).length) {
    throw new Error("Not allowed to update this report");
  }

  const entry = threadStore.find(
    (t) => t.id === commentId && t.reportId === reportId && t.type === "comment",
  );
  if (!entry) throw new Error("Comment not found");
  if (entry.authorAgentId !== actor.id) {
    throw new Error("Only the author can edit this comment");
  }

  const body = input.body.trim();
  if (!body) throw new Error("Comment body is required");

  entry.body = body;
  report.updatedAt = nowIso();
  report.lastActivityAt = nowIso();
  report.version += 1;
  return { ...entry };
}

export async function getAgentsForAssignment(actor?: ReportActor) {
  const agents = listAgents().filter((a) => a.isActive);
  if (!actor || actor.role === "admin" || actor.customerScope.type !== "specific") {
    return agents;
  }
  const actorCustomerIds = actor.customerScope.customerIds;
  return agents.filter(
    (a) =>
      a.role === "admin" ||
      a.customerScope.type === "all" ||
      a.customerScope.customerIds.some((id) => actorCustomerIds.includes(id)),
  );
}

/** Internal: expose store for legacy adapters */
export function __getReportStoreSnapshot(): Report[] {
  return [...reportStore];
}
