import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addReportAssignee,
  addReportComment,
  getAgentsForAssignment,
  getReportById,
  getReportsPaginated,
  removeReportAssignee,
  updateReport,
  updateReportComment,
} from "@/features/reports/api/reports.api";
import { toAgentAccess } from "@/features/reports/lib/report-scope";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { queryKeys } from "@/shared/lib/query-keys";
import type {
  AddReportAssigneeInput,
  AddReportCommentInput,
  RemoveReportAssigneeInput,
  ReportsQuery,
  UpdateReportCommentInput,
  UpdateReportInput,
} from "@/shared/types/report";

export function useAgentAccess() {
  const { agent } = useAuth();
  return useMemo(() => toAgentAccess(agent), [agent]);
}

export function useReportsPaginatedQuery(query: ReportsQuery) {
  const currentAgent = useAgentAccess();
  return useQuery({
    queryKey: queryKeys.reports.list(query, currentAgent.id),
    queryFn: () => getReportsPaginated(query),
  });
}

export function useReportDetailQuery(reportId: string | null) {
  return useQuery({
    queryKey: reportId ? queryKeys.reports.detail(reportId) : queryKeys.reports.all,
    queryFn: () => (reportId ? getReportById(reportId) : null),
    enabled: Boolean(reportId),
  });
}

export function useAssignmentAgentsQuery() {
  const currentAgent = useAgentAccess();
  return useQuery({
    queryKey: ["assignment-agents", currentAgent.id],
    queryFn: () => getAgentsForAssignment(),
  });
}

export function useUpdateReportMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateReportInput) => updateReport(reportId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useAddReportAssigneeMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddReportAssigneeInput) => addReportAssignee(reportId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useRemoveReportAssigneeMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RemoveReportAssigneeInput) => removeReportAssignee(reportId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useAddReportCommentMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddReportCommentInput) => addReportComment(reportId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useUpdateReportCommentMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, input }: { commentId: string; input: UpdateReportCommentInput }) =>
      updateReportComment(reportId, commentId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}
