import { createServerFn } from "@tanstack/react-start";
import { mapAgentRow, type AgentRow } from "@/features/agents/lib/map-agent-row";
import { throwHttpError } from "@/shared/lib/server-fn-error";
import { requireSession, scopedCustomerIds, assertCustomerAccess } from "@/shared/lib/server-auth";
import {
  mapAssigneeRow,
  mapReportRow,
  mapThreadRow,
  toReportListItem,
  type ReportAssigneeRow,
  type ReportRow,
  type ReportThreadRow,
} from "@/features/reports/lib/map-report-row";
import { syncDerivedAssigneeFields } from "@/features/reports/lib/report-assignees";
import { reportToIncidentLog } from "@/features/reports/lib/report-legacy";
import { agentCanAccessCustomer } from "@/shared/lib/access";
import {
  agentCanAssignReport,
  agentCanEditReport,
  toAgentAccess,
} from "@/features/reports/lib/report-scope";
import {
  addReportAssigneeSchema,
  addReportCommentSchema,
  createReportSchema,
  listIncidentLogsSchema,
  removeReportAssigneeSchema,
  reportIdSchema,
  reportsQuerySchema,
  updateReportCommentSchema,
  updateReportSchema,
} from "@/features/reports/validations/report.schema";
import { createSupabaseAdmin } from "@/shared/lib/supabase/admin";
import type { Agent } from "@/shared/types/agent";
import type { IncidentLog } from "@/shared/types";
import type {
  PaginatedReports,
  Report,
  ReportAssignee,
  ReportDetail,
  ReportStatus,
  ReportThreadEntry,
} from "@/shared/types/report";

type SupabaseAdmin = ReturnType<typeof createSupabaseAdmin>;

function asReportRow(data: unknown): ReportRow {
  return data as ReportRow;
}

function asReportRows(data: unknown): ReportRow[] {
  return (data as ReportRow[] | null) ?? [];
}

/** Columns needed for list rows (omit large note/action payloads). */
const REPORT_LIST_SELECT = [
  "id",
  "display_id",
  "issue_name",
  "issue_type",
  "priority",
  "status",
  "source",
  "customer_id",
  "property_id",
  "protocol_id",
  "created_by_agent_id",
  "caller_name",
  "caller_contact",
  "reservation_number",
  "name_on_booking",
  "customer_name",
  "property_name",
  "created_by_agent_name",
  "created_at",
  "updated_at",
  "last_activity_at",
  "resolved_at",
  "version",
].join(",");

const REPORT_DETAIL_SELECT = [
  REPORT_LIST_SELECT,
  "call_notes",
  "actions_taken",
].join(",");

/** Live `agents.name` by id — authoritative when the agent still exists. */
async function loadAgentNamesById(
  supabase: SupabaseAdmin,
  agentIds: string[],
): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const unique = [...new Set(agentIds.filter(Boolean))];
  if (unique.length === 0) return names;

  const { data, error } = await supabase.from("agents").select("id, name").in("id", unique);
  if (error) throwHttpError(error.message || "Failed to load agent names.", 500);

  for (const row of (data ?? []) as { id: string; name: string }[]) {
    names.set(row.id, row.name);
  }
  return names;
}

function resolveAssigneeName(
  assignee: ReportAssignee,
  names: Map<string, string>,
): ReportAssignee {
  return {
    ...assignee,
    agentName: names.get(assignee.agentId) ?? assignee.agentName,
  };
}

function resolveThreadAuthorName(
  entry: ReportThreadEntry,
  names: Map<string, string>,
): ReportThreadEntry {
  return {
    ...entry,
    authorAgentName: names.get(entry.authorAgentId) ?? entry.authorAgentName,
  };
}

function resolveReportAgentNames(report: Report, names: Map<string, string>): Report {
  const assignees = report.assignees.map((assignee) => resolveAssigneeName(assignee, names));
  const next: Report = {
    ...report,
    assignees,
    createdByAgentName: names.get(report.createdByAgentId) ?? report.createdByAgentName,
  };
  syncDerivedAssigneeFields(next);
  return next;
}

async function loadAssignees(
  supabase: SupabaseAdmin,
  reportId: string,
): Promise<ReportAssignee[]> {
  const { data, error } = await supabase
    .from("report_assignees")
    .select("*")
    .eq("report_id", reportId)
    .order("assigned_at");

  if (error) throwHttpError(error.message || "Failed to load assignees.", 500);
  const assignees = ((data ?? []) as ReportAssigneeRow[]).map(mapAssigneeRow);
  const names = await loadAgentNamesById(
    supabase,
    assignees.map((assignee) => assignee.agentId),
  );
  return assignees.map((assignee) => resolveAssigneeName(assignee, names));
}

async function loadAssigneesForReports(
  supabase: SupabaseAdmin,
  reportIds: string[],
): Promise<Map<string, ReportAssignee[]>> {
  const map = new Map<string, ReportAssignee[]>();
  if (reportIds.length === 0) return map;

  const { data, error } = await supabase
    .from("report_assignees")
    .select("*")
    .in("report_id", reportIds)
    .order("assigned_at");

  if (error) throwHttpError(error.message || "Failed to load assignees.", 500);

  const rows = (data ?? []) as ReportAssigneeRow[];
  const names = await loadAgentNamesById(
    supabase,
    rows.map((row) => row.agent_id),
  );

  for (const row of rows) {
    const list = map.get(row.report_id) ?? [];
    list.push(resolveAssigneeName(mapAssigneeRow(row), names));
    map.set(row.report_id, list);
  }
  return map;
}

async function loadThreadCounts(
  supabase: SupabaseAdmin,
  reportIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (reportIds.length === 0) return counts;

  const { data, error } = await supabase.rpc("count_report_thread_entries", {
    p_report_ids: reportIds,
  });

  if (error) throwHttpError(error.message || "Failed to load thread counts.", 500);

  for (const row of (data ?? []) as { report_id: string; entry_count: number | string }[]) {
    counts.set(row.report_id, Number(row.entry_count) || 0);
  }
  return counts;
}

async function loadThread(
  supabase: SupabaseAdmin,
  reportId: string,
): Promise<ReportThreadEntry[]> {
  const { data, error } = await supabase
    .from("report_thread_entries")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at");

  if (error) throwHttpError(error.message || "Failed to load thread.", 500);
  const entries = ((data ?? []) as ReportThreadRow[]).map(mapThreadRow);
  const names = await loadAgentNamesById(
    supabase,
    entries.map((entry) => entry.authorAgentId),
  );
  return entries.map((entry) => resolveThreadAuthorName(entry, names));
}

async function loadReportRow(
  supabase: SupabaseAdmin,
  reportId: string,
): Promise<ReportRow | null> {
  const { data, error } = await supabase
    .from("reports")
    .select(REPORT_DETAIL_SELECT)
    .eq("id", reportId)
    .maybeSingle();

  if (error) throwHttpError(error.message || "Failed to load report.", 500);
  return data ? asReportRow(data) : null;
}

async function loadReport(
  supabase: SupabaseAdmin,
  reportId: string,
): Promise<Report | null> {
  const row = await loadReportRow(supabase, reportId);
  if (!row) return null;
  const assignees = await loadAssignees(supabase, reportId);
  const report = mapReportRow(row, assignees);
  const names = await loadAgentNamesById(supabase, [report.createdByAgentId]);
  return resolveReportAgentNames(report, names);
}

async function loadReportDetail(
  supabase: SupabaseAdmin,
  reportId: string,
): Promise<ReportDetail | null> {
  const row = await loadReportRow(supabase, reportId);
  if (!row) return null;
  const [assignees, thread] = await Promise.all([
    loadAssignees(supabase, reportId),
    loadThread(supabase, reportId),
  ]);
  const report = mapReportRow(row, assignees);
  const names = await loadAgentNamesById(supabase, [report.createdByAgentId]);
  return { report: resolveReportAgentNames(report, names), thread };
}

async function insertThreadEntry(
  supabase: SupabaseAdmin,
  entry: {
    report_id: string;
    type: ReportThreadEntry["type"];
    author_agent_id: string;
    author_agent_name: string;
    body?: string | null;
    parent_id?: string | null;
    metadata?: ReportThreadEntry["metadata"] | null;
    created_at?: string;
  },
): Promise<ReportThreadEntry> {
  const { data, error } = await supabase
    .from("report_thread_entries")
    .insert(entry)
    .select("*")
    .single();

  if (error || !data) {
    throwHttpError(error?.message ?? "Failed to write thread entry.", 500);
  }
  return mapThreadRow(data as ReportThreadRow);
}

async function touchReportTimestamps(
  supabase: SupabaseAdmin,
  reportId: string,
  patch: {
    version: number;
    resolved_at?: string | null;
    extra?: Record<string, unknown>;
  },
  now: string,
) {
  const { data, error } = await supabase
    .from("reports")
    .update({
      updated_at: now,
      last_activity_at: now,
      version: patch.version,
      ...(patch.resolved_at !== undefined ? { resolved_at: patch.resolved_at } : {}),
      ...patch.extra,
    })
    .eq("id", reportId)
    .select(REPORT_DETAIL_SELECT)
    .single();

  if (error || !data) {
    throwHttpError(error?.message ?? "Failed to update report.", 500);
  }
  return asReportRow(data);
}

async function nextDisplayId(supabase: SupabaseAdmin): Promise<string> {
  const { data, error } = await supabase.rpc("next_report_display_id");
  if (error || typeof data !== "string" || !data) {
    throwHttpError(error?.message || "Failed to generate report id.", 500);
  }
  return data;
}

async function resolveCustomerName(
  supabase: SupabaseAdmin,
  customerId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from("customers")
    .select("name")
    .eq("id", customerId)
    .maybeSingle();

  if (error) throwHttpError(error.message || "Failed to load customer.", 500);
  if (!data) throwHttpError("Customer not found.", 404);
  return (data as { name: string }).name;
}

async function resolveProperty(
  supabase: SupabaseAdmin,
  propertyId: string,
): Promise<{ name: string; customer_id: string }> {
  const { data, error } = await supabase
    .from("properties")
    .select("name, customer_id")
    .eq("id", propertyId)
    .maybeSingle();

  if (error) throwHttpError(error.message || "Failed to load property.", 500);
  if (!data) throwHttpError("Property not found.", 404);
  return data as { name: string; customer_id: string };
}

async function loadAgentRow(
  supabase: SupabaseAdmin,
  agentId: string,
): Promise<Agent> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .maybeSingle();

  if (error) throwHttpError(error.message || "Failed to load agent.", 500);
  if (!data) throwHttpError("Agent not found.", 404);
  return mapAgentRow(data as AgentRow);
}

function emptyPage(page: number, limit: number): PaginatedReports {
  return {
    data: [],
    pagination: { page, limit, total: 0, totalPages: 1 },
  };
}

async function finalizeNewReport(
  supabase: SupabaseAdmin,
  reportRow: ReportRow,
  currentAgent: { id: string; name: string },
  now: string,
): Promise<Report> {
  const { error: assigneeError } = await supabase.from("report_assignees").insert({
    report_id: reportRow.id,
    agent_id: currentAgent.id,
    agent_name: currentAgent.name,
    assigned_at: now,
    assigned_by_agent_id: currentAgent.id,
  });

  if (assigneeError) {
    throwHttpError(assigneeError.message || "Failed to assign report creator.", 500);
  }

  await insertThreadEntry(supabase, {
    report_id: reportRow.id,
    type: "system",
    author_agent_id: currentAgent.id,
    author_agent_name: currentAgent.name,
    body: "Report created and assigned to you",
    created_at: now,
  });

  return mapReportRow(reportRow, [
    {
      agentId: currentAgent.id,
      agentName: currentAgent.name,
      assignedAt: now,
      assignedByAgentId: currentAgent.id,
    },
  ]);
}

export const listReportsFn = createServerFn({ method: "POST" })
  .validator(reportsQuerySchema)
  .handler(async ({ data }): Promise<PaginatedReports> => {
    const session = await requireSession();
    const agent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();
    const scopeIds = scopedCustomerIds(agent);

    let customerFilter: string[] | null = null;

    if (data.customerId) {
      assertCustomerAccess(agent, data.customerId);
      if (scopeIds && !scopeIds.includes(data.customerId)) {
        return emptyPage(data.page, data.limit);
      }
      customerFilter = [data.customerId];
    } else if (data.customerIds && data.customerIds.length > 0) {
      const requested = data.customerIds.filter((id) => agentCanAccessCustomer(agent, id));
      customerFilter = scopeIds
        ? requested.filter((id) => scopeIds.includes(id))
        : requested;
      if (customerFilter.length === 0) return emptyPage(data.page, data.limit);
    } else if (scopeIds) {
      if (scopeIds.length === 0) return emptyPage(data.page, data.limit);
      customerFilter = scopeIds;
    }

    let assignedReportIds: string[] | null = null;
    if (data.assignedAgentIds && data.assignedAgentIds.length > 0) {
      const { data: assigneeRows, error: assigneeError } = await supabase
        .from("report_assignees")
        .select("report_id")
        .in("agent_id", data.assignedAgentIds);

      if (assigneeError) {
        throwHttpError(assigneeError.message || "Failed to filter assignees.", 500);
      }

      assignedReportIds = [
        ...new Set(
          ((assigneeRows ?? []) as { report_id: string }[]).map((row) => row.report_id),
        ),
      ];
      if (assignedReportIds.length === 0) return emptyPage(data.page, data.limit);
    }

    let query = supabase.from("reports").select(REPORT_LIST_SELECT, { count: "exact" });

    if (customerFilter) query = query.in("customer_id", customerFilter);
    if (assignedReportIds) query = query.in("id", assignedReportIds);

    if (data.statuses && data.statuses.length > 0) {
      query = query.in("status", data.statuses);
    }
    if (data.priorities && data.priorities.length > 0) {
      query = query.in("priority", data.priorities);
    }
    if (data.propertyIds && data.propertyIds.length > 0) {
      query = query.in("property_id", data.propertyIds);
    }
    if (data.issueTypes && data.issueTypes.length > 0) {
      query = query.in("issue_type", data.issueTypes);
    }
    if (data.dateFrom) {
      query = query.gte("last_activity_at", `${data.dateFrom}T00:00:00.000Z`);
    }
    if (data.dateTo) {
      query = query.lte("last_activity_at", `${data.dateTo}T23:59:59.999Z`);
    }

    const search = (data.search?.trim() ?? "").replace(/[,()]/g, "");
    if (search) {
      query = query.or(
        [
          `display_id.ilike.%${search}%`,
          `issue_name.ilike.%${search}%`,
          `issue_type.ilike.%${search}%`,
          `caller_name.ilike.%${search}%`,
          `caller_contact.ilike.%${search}%`,
          `reservation_number.ilike.%${search}%`,
          `name_on_booking.ilike.%${search}%`,
          `property_name.ilike.%${search}%`,
          `customer_name.ilike.%${search}%`,
          `call_notes.ilike.%${search}%`,
        ].join(","),
      );
    }

    const from = (data.page - 1) * data.limit;
    const to = from + data.limit - 1;

    const { data: rows, error, count } = await query
      .order("last_activity_at", { ascending: false })
      .range(from, to);

    if (error) throwHttpError(error.message || "Failed to load reports.", 500);

    const reportRows = asReportRows(rows);
    const ids = reportRows.map((row) => row.id);
    const [assigneesByReport, threadCounts, creatorNames] = await Promise.all([
      loadAssigneesForReports(supabase, ids),
      loadThreadCounts(supabase, ids),
      loadAgentNamesById(
        supabase,
        reportRows.map((row) => row.created_by_agent_id),
      ),
    ]);

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / data.limit));

    return {
      data: reportRows.map((row) =>
        toReportListItem(
          resolveReportAgentNames(
            mapReportRow(row, assigneesByReport.get(row.id) ?? []),
            creatorNames,
          ),
          threadCounts.get(row.id) ?? 0,
        ),
      ),
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages,
      },
    };
  });

export const getReportFn = createServerFn({ method: "POST" })
  .validator(reportIdSchema)
  .handler(async ({ data }): Promise<ReportDetail | null> => {
    const session = await requireSession();
    const agent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();

    const detail = await loadReportDetail(supabase, data.id);
    if (!detail) return null;
    if (!agentCanAccessCustomer(agent, detail.report.customerId)) return null;
    return detail;
  });

export const createReportFn = createServerFn({ method: "POST" })
  .validator(createReportSchema)
  .handler(async ({ data }): Promise<Report> => {
    const session = await requireSession();
    const currentAgent = toAgentAccess(session.agent);
    assertCustomerAccess(currentAgent, data.customerId);

    const supabase = createSupabaseAdmin();
    const now = new Date().toISOString();
    const status: ReportStatus = data.status ?? "OPEN";
    const propertyId: string | null = data.propertyId ?? null;

    const [customerName, property, protocolResult, displayId] = await Promise.all([
      resolveCustomerName(supabase, data.customerId),
      propertyId ? resolveProperty(supabase, propertyId) : Promise.resolve(null),
      data.protocolIssueId
        ? supabase.from("protocols").select("id").eq("id", data.protocolIssueId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      nextDisplayId(supabase),
    ]);

    let propertyName = "—";
    if (propertyId) {
      if (!property) throwHttpError("Property not found.", 404);
      if (property.customer_id !== data.customerId) {
        throwHttpError("Property does not belong to the selected customer.", 400);
      }
      propertyName = property.name;
    }

    if (data.protocolIssueId) {
      if (protocolResult.error) {
        throwHttpError(protocolResult.error.message || "Failed to validate protocol.", 500);
      }
      if (!protocolResult.data) throwHttpError("Protocol not found.", 404);
    }

    const { data: row, error } = await supabase
      .from("reports")
      .insert({
        display_id: displayId,
        issue_name: data.issueName.trim(),
        issue_type: data.issueType.trim(),
        priority: data.priority,
        status,
        source: data.source ?? "manual",
        customer_id: data.customerId,
        property_id: propertyId,
        protocol_id: data.protocolIssueId ?? null,
        created_by_agent_id: currentAgent.id,
        caller_name: data.callerName,
        caller_contact: data.callerContact,
        reservation_number: data.reservationNumber,
        name_on_booking: data.nameOnBooking,
        call_notes: data.callNotes,
        actions_taken: data.actionsTaken,
        customer_name: customerName,
        property_name: propertyName,
        created_by_agent_name: currentAgent.name,
        created_at: now,
        updated_at: now,
        last_activity_at: now,
        resolved_at: status === "RESOLVED" ? now : null,
        version: 1,
      })
      .select(REPORT_DETAIL_SELECT)
      .single();

    if (error || !row) {
      // Retry once on rare display_id collision
      if (error?.code === "23505" && error.message?.includes("display_id")) {
        const retryId = await nextDisplayId(supabase);
        const retry = await supabase
          .from("reports")
          .insert({
            display_id: retryId,
            issue_name: data.issueName.trim(),
            issue_type: data.issueType.trim(),
            priority: data.priority,
            status,
            source: data.source ?? "manual",
            customer_id: data.customerId,
            property_id: propertyId,
            protocol_id: data.protocolIssueId ?? null,
            created_by_agent_id: currentAgent.id,
            caller_name: data.callerName,
            caller_contact: data.callerContact,
            reservation_number: data.reservationNumber,
            name_on_booking: data.nameOnBooking,
            call_notes: data.callNotes,
            actions_taken: data.actionsTaken,
            customer_name: customerName,
            property_name: propertyName,
            created_by_agent_name: currentAgent.name,
            created_at: now,
            updated_at: now,
            last_activity_at: now,
            resolved_at: status === "RESOLVED" ? now : null,
            version: 1,
          })
          .select(REPORT_DETAIL_SELECT)
          .single();
        if (retry.error || !retry.data) {
          throwHttpError(retry.error?.message ?? "Failed to create report.", 500);
        }
        return finalizeNewReport(
          supabase,
          asReportRow(retry.data),
          currentAgent,
          now,
        );
      }
      throwHttpError(error?.message ?? "Failed to create report.", 500);
    }

    return finalizeNewReport(supabase, asReportRow(row), currentAgent, now);
  });

export const updateReportFn = createServerFn({ method: "POST" })
  .validator(updateReportSchema)
  .handler(async ({ data }): Promise<Report> => {
    const session = await requireSession();
    const currentAgent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();

    const existing = await loadReport(supabase, data.id);
    if (!existing) throwHttpError("Report not found.", 404);
    if (!agentCanEditReport(currentAgent, existing)) {
      throwHttpError("Not allowed to update this report.", 403);
    }
    if (data.version !== existing.version) {
      throwHttpError("Report was updated by someone else.", 409);
    }

    const now = new Date().toISOString();
    const previousStatus = existing.status;
    const changedFields: string[] = [];
    const patch: Record<string, unknown> = {};

    const assignField = (
      camel: string,
      column: string,
      value: unknown,
      current: unknown,
    ) => {
      if (value !== undefined && value !== current) {
        changedFields.push(camel);
        patch[column] = value;
      }
    };

    assignField("issueName", "issue_name", data.issueName?.trim(), existing.issueName);
    assignField("issueType", "issue_type", data.issueType?.trim(), existing.issueType);
    assignField("priority", "priority", data.priority, existing.priority);
    assignField("callerName", "caller_name", data.callerName, existing.callerName);
    assignField("callerContact", "caller_contact", data.callerContact, existing.callerContact);
    assignField(
      "reservationNumber",
      "reservation_number",
      data.reservationNumber,
      existing.reservationNumber,
    );
    assignField("nameOnBooking", "name_on_booking", data.nameOnBooking, existing.nameOnBooking);
    assignField("callNotes", "call_notes", data.callNotes, existing.callNotes);
    assignField("actionsTaken", "actions_taken", data.actionsTaken, existing.actionsTaken);

    if (data.protocolIssueId !== undefined) {
      const next = data.protocolIssueId;
      if (next !== (existing.protocolIssueId ?? null)) {
        changedFields.push("protocolIssueId");
        patch.protocol_id = next;
      }
    }

    if (data.customerId && data.customerId !== existing.customerId) {
      assertCustomerAccess(currentAgent, data.customerId);
      changedFields.push("customerId");
      patch.customer_id = data.customerId;
      patch.customer_name = await resolveCustomerName(supabase, data.customerId);
    }

    if (data.propertyId !== undefined) {
      const nextPropertyId = data.propertyId;
      if (nextPropertyId !== (existing.propertyId ?? null)) {
        changedFields.push("propertyId");
        if (nextPropertyId) {
          const property = await resolveProperty(supabase, nextPropertyId);
          const customerId =
            (patch.customer_id as string | undefined) ?? existing.customerId;
          if (property.customer_id !== customerId) {
            throwHttpError("Property does not belong to the selected customer.", 400);
          }
          patch.property_id = nextPropertyId;
          patch.property_name = property.name;
        } else {
          patch.property_id = null;
          patch.property_name = "—";
        }
      }
    }

    const statusChanged = data.status !== undefined && data.status !== previousStatus;
    let resolvedAt: string | null | undefined;

    if (statusChanged) {
      patch.status = data.status;
      if (data.status === "RESOLVED") {
        resolvedAt = now;
      } else if (previousStatus === "RESOLVED") {
        resolvedAt = null;
      }
    }

    const nextVersion = existing.version + 1;
    const editFields = changedFields.filter((field) => field !== "status");

    const { data: updatedRow, error } = await supabase
      .from("reports")
      .update({
        ...patch,
        updated_at: now,
        last_activity_at: now,
        version: nextVersion,
        ...(resolvedAt !== undefined ? { resolved_at: resolvedAt } : {}),
      })
      .eq("id", data.id)
      .eq("version", data.version)
      .select("*")
      .single();

    if (error || !updatedRow) {
      if (error?.code === "PGRST116") {
        throwHttpError("Report was updated by someone else.", 409);
      }
      throwHttpError(error?.message ?? "Failed to update report.", 500);
    }

    if (statusChanged && data.status) {
      await insertThreadEntry(supabase, {
        report_id: data.id,
        type: "status_change",
        author_agent_id: currentAgent.id,
        author_agent_name: currentAgent.name,
        metadata: { fromStatus: previousStatus, toStatus: data.status },
        created_at: now,
      });
    } else if (editFields.length > 0) {
      await insertThreadEntry(supabase, {
        report_id: data.id,
        type: "field_edit",
        author_agent_id: currentAgent.id,
        author_agent_name: currentAgent.name,
        metadata: { changedFields: editFields },
        created_at: now,
      });
    }

    const assignees = await loadAssignees(supabase, data.id);
    return mapReportRow(updatedRow as ReportRow, assignees);
  });

export const addReportAssigneeFn = createServerFn({ method: "POST" })
  .validator(addReportAssigneeSchema)
  .handler(async ({ data }): Promise<Report> => {
    const session = await requireSession();
    const currentAgent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();

    const [row, assignees, target] = await Promise.all([
      loadReportRow(supabase, data.id),
      loadAssignees(supabase, data.id),
      loadAgentRow(supabase, data.agentId),
    ]);
    if (!row) throwHttpError("Report not found.", 404);
    const report = mapReportRow(row, assignees);
    if (!agentCanAssignReport(currentAgent, report)) {
      throwHttpError("Not allowed to assign agents on this report.", 403);
    }

    if (report.assignees.some((a) => a.agentId === data.agentId)) {
      return report;
    }

    if (!target.isActive) throwHttpError("Agent is not active.", 400);
    if (!agentCanAccessCustomer(toAgentAccess(target), report.customerId)) {
      throwHttpError("Agent cannot access this report's customer.", 400);
    }

    const now = new Date().toISOString();

    const { error: insertError } = await supabase.from("report_assignees").insert({
      report_id: data.id,
      agent_id: target.id,
      agent_name: target.name,
      assigned_at: now,
      assigned_by_agent_id: currentAgent.id,
    });

    if (insertError) {
      throwHttpError(insertError.message || "Failed to add assignee.", 500);
    }

    const nextAssignees: ReportAssignee[] = [
      ...report.assignees,
      {
        agentId: target.id,
        agentName: target.name,
        assignedAt: now,
        assignedByAgentId: currentAgent.id,
      },
    ];

    const [, updatedRow] = await Promise.all([
      insertThreadEntry(supabase, {
        report_id: data.id,
        type: "assignment",
        author_agent_id: currentAgent.id,
        author_agent_name: currentAgent.name,
        body: data.note?.trim() || null,
        metadata: {
          action: "added",
          toAgentId: target.id,
          toAgentName: target.name,
        },
        created_at: now,
      }),
      touchReportTimestamps(supabase, data.id, { version: report.version + 1 }, now),
    ]);

    return mapReportRow(updatedRow, nextAssignees);
  });

export const removeReportAssigneeFn = createServerFn({ method: "POST" })
  .validator(removeReportAssigneeSchema)
  .handler(async ({ data }): Promise<Report> => {
    const session = await requireSession();
    const currentAgent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();

    const [row, assignees] = await Promise.all([
      loadReportRow(supabase, data.id),
      loadAssignees(supabase, data.id),
    ]);
    if (!row) throwHttpError("Report not found.", 404);
    const report = mapReportRow(row, assignees);
    if (!agentCanAssignReport(currentAgent, report)) {
      throwHttpError("Not allowed to assign agents on this report.", 403);
    }

    const existing = report.assignees.find((a) => a.agentId === data.agentId);
    if (!existing) return report;

    const { error: deleteError } = await supabase
      .from("report_assignees")
      .delete()
      .eq("report_id", data.id)
      .eq("agent_id", data.agentId);

    if (deleteError) {
      throwHttpError(deleteError.message || "Failed to remove assignee.", 500);
    }

    const now = new Date().toISOString();
    const nextAssignees = report.assignees.filter((a) => a.agentId !== data.agentId);

    const [, updatedRow] = await Promise.all([
      insertThreadEntry(supabase, {
        report_id: data.id,
        type: "assignment",
        author_agent_id: currentAgent.id,
        author_agent_name: currentAgent.name,
        metadata: {
          action: "removed",
          toAgentId: existing.agentId,
          toAgentName: existing.agentName,
        },
        created_at: now,
      }),
      touchReportTimestamps(supabase, data.id, { version: report.version + 1 }, now),
    ]);

    return mapReportRow(updatedRow, nextAssignees);
  });
export const addReportCommentFn = createServerFn({ method: "POST" })
  .validator(addReportCommentSchema)
  .handler(async ({ data }): Promise<ReportThreadEntry> => {
    const session = await requireSession();
    const currentAgent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();

    const report = await loadReport(supabase, data.id);
    if (!report) throwHttpError("Report not found.", 404);
    if (!agentCanAccessCustomer(currentAgent, report.customerId)) {
      throwHttpError("Not allowed to comment on this report.", 403);
    }

    let parentId: string | null = null;
    if (data.parentId) {
      const { data: parent, error: parentError } = await supabase
        .from("report_thread_entries")
        .select("*")
        .eq("id", data.parentId)
        .eq("report_id", data.id)
        .eq("type", "comment")
        .maybeSingle();

      if (parentError) {
        throwHttpError(parentError.message || "Failed to load parent comment.", 500);
      }
      if (!parent) throwHttpError("Parent comment not found.", 404);
      if ((parent as ReportThreadRow).parent_id) {
        throwHttpError("Cannot reply to a thread reply.", 400);
      }
      parentId = (parent as ReportThreadRow).id;
    }

    const now = new Date().toISOString();
    const entry = await insertThreadEntry(supabase, {
      report_id: data.id,
      type: "comment",
      author_agent_id: currentAgent.id,
      author_agent_name: currentAgent.name,
      body: data.body.trim(),
      parent_id: parentId,
      created_at: now,
    });

    await touchReportTimestamps(
      supabase,
      data.id,
      { version: report.version + 1 },
      now,
    );

    return entry;
  });

export const updateReportCommentFn = createServerFn({ method: "POST" })
  .validator(updateReportCommentSchema)
  .handler(async ({ data }): Promise<ReportThreadEntry> => {
    const session = await requireSession();
    const currentAgent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();

    const report = await loadReport(supabase, data.reportId);
    if (!report) throwHttpError("Report not found.", 404);
    if (!agentCanAccessCustomer(currentAgent, report.customerId)) {
      throwHttpError("Not allowed to update this report.", 403);
    }

    const { data: existing, error: loadError } = await supabase
      .from("report_thread_entries")
      .select("*")
      .eq("id", data.commentId)
      .eq("report_id", data.reportId)
      .eq("type", "comment")
      .maybeSingle();

    if (loadError) throwHttpError(loadError.message || "Failed to load comment.", 500);
    if (!existing) throwHttpError("Comment not found.", 404);

    const entryRow = existing as ReportThreadRow;
    if (entryRow.author_agent_id !== currentAgent.id) {
      throwHttpError("Only the author can edit this comment.", 403);
    }

    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from("report_thread_entries")
      .update({ body: data.body.trim() })
      .eq("id", data.commentId)
      .select("*")
      .single();

    if (updateError || !updated) {
      throwHttpError(updateError?.message ?? "Failed to update comment.", 500);
    }

    await touchReportTimestamps(
      supabase,
      data.reportId,
      { version: report.version + 1 },
      now,
    );

    return mapThreadRow(updated as ReportThreadRow);
  });

export const listAssignmentAgentsFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<Agent[]> => {
    const session = await requireSession();
    const currentAgent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throwHttpError(error.message || "Failed to load agents.", 500);

    const agents = ((data ?? []) as AgentRow[]).map(mapAgentRow);

    if (
      currentAgent.role === "admin" ||
      !currentAgent.customerScope ||
      currentAgent.customerScope.type !== "specific"
    ) {
      return agents;
    }

    const allowedCustomerIds = currentAgent.customerScope.customerIds;
    return agents.filter(
      (a) =>
        a.role === "admin" ||
        a.customerScope.type === "all" ||
        a.customerScope.customerIds.some((id) => allowedCustomerIds.includes(id)),
    );
  },
);

export const listIncidentLogsFn = createServerFn({ method: "POST" })
  .validator(listIncidentLogsSchema)
  .handler(async ({ data }): Promise<IncidentLog[]> => {
    const session = await requireSession();
    const agent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();
    const scopeIds = scopedCustomerIds(agent);

    let query = supabase.from("reports").select("*");

    if (data.customerId) {
      assertCustomerAccess(agent, data.customerId);
      if (scopeIds && !scopeIds.includes(data.customerId)) return [];
      query = query.eq("customer_id", data.customerId);
    } else if (scopeIds) {
      if (scopeIds.length === 0) return [];
      query = query.in("customer_id", scopeIds);
    }

    if (data.propertyId) query = query.eq("property_id", data.propertyId);
    if (data.protocolIssueId) query = query.eq("protocol_id", data.protocolIssueId);

    query = query.order("created_at", { ascending: false });

    if (data.limit) {
      query = query.limit(data.limit);
    }

    const { data: rows, error } = await query;
    if (error) throwHttpError(error.message || "Failed to load incident logs.", 500);

    const reportRows = (rows ?? []) as ReportRow[];
    const assigneesByReport = await loadAssigneesForReports(
      supabase,
      reportRows.map((row) => row.id),
    );

    return reportRows.map((row) =>
      reportToIncidentLog(mapReportRow(row, assigneesByReport.get(row.id) ?? [])),
    );
  });
