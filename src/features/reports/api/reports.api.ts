import {
  addReportAssigneeFn,
  addReportCommentFn,
  createReportFn,
  getReportFn,
  listAssignmentAgentsFn,
  listIncidentLogsFn,
  listReportsFn,
  removeReportAssigneeFn,
  updateReportCommentFn,
  updateReportFn,
} from "@/features/reports/reports.functions";
import type { Agent } from "@/shared/types/agent";
import type { IncidentLog, IncidentLogFilters } from "@/shared/types";
import type {
  AddReportAssigneeInput,
  AddReportCommentInput,
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

export async function getReportsPaginated(
  query: ReportsQuery,
): Promise<PaginatedReports> {
  return listReportsFn({ data: query });
}

export async function getReportById(
  id: string,
): Promise<ReportDetail | null> {
  return getReportFn({ data: { id } });
}

export async function createReport(
  input: CreateReportInput,
): Promise<Report> {
  return createReportFn({ data: input });
}

export async function updateReport(
  id: string,
  input: UpdateReportInput,
): Promise<Report> {
  return updateReportFn({ data: { ...input, id } });
}

export async function addReportAssignee(
  id: string,
  input: AddReportAssigneeInput,
): Promise<Report> {
  return addReportAssigneeFn({ data: { id, ...input } });
}

export async function removeReportAssignee(
  id: string,
  input: RemoveReportAssigneeInput,
): Promise<Report> {
  return removeReportAssigneeFn({ data: { id, ...input } });
}

export async function addReportComment(
  id: string,
  input: AddReportCommentInput,
): Promise<ReportThreadEntry> {
  return addReportCommentFn({ data: { id, ...input } });
}

export async function updateReportComment(
  reportId: string,
  commentId: string,
  input: UpdateReportCommentInput,
): Promise<ReportThreadEntry> {
  return updateReportCommentFn({
    data: { reportId, commentId, body: input.body },
  });
}

export async function getAgentsForAssignment(): Promise<Agent[]> {
  return listAssignmentAgentsFn();
}

export async function getIncidentLogsFromReports(
  filters: IncidentLogFilters = {},
): Promise<IncidentLog[]> {
  return listIncidentLogsFn({ data: filters });
}
