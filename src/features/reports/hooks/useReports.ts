import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addReportAssignee,
  addReportComment,
  assignReport,
  getAgentsForAssignment,
  getReportById,
  getReportsPaginated,
  removeReportAssignee,
  updateReport,
  updateReportComment,
} from "@/features/reports/api/reports.api";
import { toReportActor } from "@/features/reports/lib/report-scope";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { queryKeys } from "@/shared/lib/query-keys";
import type {
  AddReportAssigneeInput,
  AddReportCommentInput,
  AssignReportInput,
  RemoveReportAssigneeInput,
  ReportsQuery,
  UpdateReportCommentInput,
  UpdateReportInput,
} from "@/shared/types/report";

export function useReportActor() {
  const { agent } = useAuth();
  return useMemo(() => toReportActor(agent), [agent]);
}

export function useReportsPaginatedQuery(query: ReportsQuery) {
  const actor = useReportActor();
  return useQuery({
    queryKey: queryKeys.reports.list(query, actor.id),
    queryFn: () => getReportsPaginated(query, actor),
  });
}

export function useReportDetailQuery(reportId: string | null) {
  const actor = useReportActor();
  return useQuery({
    queryKey: reportId ? queryKeys.reports.detail(reportId) : queryKeys.reports.all,
    queryFn: () => (reportId ? getReportById(reportId, actor) : null),
    enabled: Boolean(reportId),
  });
}

export function useAssignmentAgentsQuery() {
  const actor = useReportActor();
  return useQuery({
    queryKey: ["assignment-agents", actor.id],
    queryFn: () => getAgentsForAssignment(actor),
  });
}

export function useUpdateReportMutation(reportId: string) {
  const actor = useReportActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateReportInput) => updateReport(reportId, input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useAssignReportMutation(reportId: string) {
  const actor = useReportActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignReportInput) => assignReport(reportId, input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useAddReportAssigneeMutation(reportId: string) {
  const actor = useReportActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddReportAssigneeInput) => addReportAssignee(reportId, input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useRemoveReportAssigneeMutation(reportId: string) {
  const actor = useReportActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RemoveReportAssigneeInput) =>
      removeReportAssignee(reportId, input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useAddReportCommentMutation(reportId: string) {
  const actor = useReportActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddReportCommentInput) => addReportComment(reportId, input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useUpdateReportCommentMutation(reportId: string) {
  const actor = useReportActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      input,
    }: {
      commentId: string;
      input: UpdateReportCommentInput;
    }) => updateReportComment(reportId, commentId, input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.detail(reportId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}
