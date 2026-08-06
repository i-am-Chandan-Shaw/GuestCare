import {
  addReportAssigneeFn,
  addReportCommentFn,
  assignReportFn,
  createReportFn,
  getReportFn,
  listAssignmentAgentsFn,
  listIncidentLogsFn,
  listReportsFn,
  removeReportAssigneeFn,
  updateReportCommentFn,
  updateReportFn,
} from "@/features/reports/reports.functions";
import type { Agent, AgentAccess } from "@/shared/types/agent";
import type { IncidentLog, IncidentLogFilters } from "@/shared/types";
import type {
  AddReportAssigneeInput,
  AddReportCommentInput,
  AssignReportInput,
  CreateReportInput,
  PaginatedReports,
  RemoveReportAssigneeInput,
  Report,
  ReportDetail,
  ReportsQuery,
  ReportThreadEntry,
  UpdateReportCommentInput,
  UpdateReportInput,
} from "@/shared/types/report";

/** Optional `currentAgent` args are ignored — auth comes from the server session. */

export async function getReportsPaginated(
  query: ReportsQuery,
  _currentAgent?: AgentAccess,
): Promise<PaginatedReports> {
  return listReportsFn({ data: query });
}

export async function getReportById(
  id: string,
  _currentAgent?: AgentAccess,
): Promise<ReportDetail | null> {
  return getReportFn({ data: { id } });
}

export async function createReport(
  input: CreateReportInput,
  _currentAgent?: AgentAccess,
): Promise<Report> {
  return createReportFn({ data: input });
}

export async function updateReport(
  id: string,
  input: UpdateReportInput,
  _currentAgent?: AgentAccess,
): Promise<Report> {
  return updateReportFn({ data: { ...input, id } });
}

export async function addReportAssignee(
  id: string,
  input: AddReportAssigneeInput,
  _currentAgent?: AgentAccess,
): Promise<Report> {
  return addReportAssigneeFn({ data: { id, ...input } });
}

export async function removeReportAssignee(
  id: string,
  input: RemoveReportAssigneeInput,
  _currentAgent?: AgentAccess,
): Promise<Report> {
  return removeReportAssigneeFn({ data: { id, ...input } });
}

/** @deprecated Prefer addReportAssignee / removeReportAssignee. */
export async function assignReport(
  id: string,
  input: AssignReportInput,
  _currentAgent?: AgentAccess,
): Promise<Report> {
  return assignReportFn({ data: { id, ...input } });
}

export async function addReportComment(
  id: string,
  input: AddReportCommentInput,
  _currentAgent?: AgentAccess,
): Promise<ReportThreadEntry> {
  return addReportCommentFn({ data: { id, ...input } });
}

export async function updateReportComment(
  reportId: string,
  commentId: string,
  input: UpdateReportCommentInput,
  _currentAgent?: AgentAccess,
): Promise<ReportThreadEntry> {
  return updateReportCommentFn({
    data: { reportId, commentId, body: input.body },
  });
}

export async function getAgentsForAssignment(_currentAgent?: AgentAccess): Promise<Agent[]> {
  return listAssignmentAgentsFn();
}

export async function getIncidentLogsFromReports(
  filters: IncidentLogFilters = {},
): Promise<IncidentLog[]> {
  return listIncidentLogsFn({ data: filters });
}
