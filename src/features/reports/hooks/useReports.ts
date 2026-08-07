import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
  formatAssigneesLabel,
  syncDerivedAssigneeFields,
} from "@/features/reports/lib/report-assignees";
import { toAgentAccess } from "@/features/reports/lib/report-scope";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { queryKeys } from "@/shared/lib/query-keys";
import type {
  AddReportAssigneeInput,
  AddReportCommentInput,
  RemoveReportAssigneeInput,
  ReportDetail,
  ReportsQuery,
  UpdateReportCommentInput,
  UpdateReportInput,
} from "@/shared/types/report";

type AddAssigneeVars = AddReportAssigneeInput & { agentName?: string };

function patchDetailAssignees(
  detail: ReportDetail,
  nextAssignees: ReportDetail["report"]["assignees"],
): ReportDetail {
  const report = {
    ...detail.report,
    assignees: nextAssignees,
    assignedAgentName: formatAssigneesLabel(nextAssignees),
  };
  syncDerivedAssigneeFields(report);
  return { ...detail, report };
}

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
  const { agent } = useAuth();
  const detailKey = queryKeys.reports.detail(reportId);

  return useMutation({
    mutationFn: ({ agentId, note }: AddAssigneeVars) =>
      addReportAssignee(reportId, { agentId, note }),
    onMutate: async ({ agentId, agentName }) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<ReportDetail>(detailKey);
      const name = agentName?.trim() || agentId;
      queryClient.setQueryData<ReportDetail>(detailKey, (current) => {
        if (!current) return current;
        if (current.report.assignees.some((a) => a.agentId === agentId)) return current;
        return patchDetailAssignees(current, [
          ...current.report.assignees,
          {
            agentId,
            agentName: name,
            assignedAt: new Date().toISOString(),
            assignedByAgentId: agent.id,
          },
        ]);
      });
      return { previous };
    },
    onSuccess: (report) => {
      queryClient.setQueryData<ReportDetail>(detailKey, (current) =>
        current ? { ...current, report } : current,
      );
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
      toast.error("Couldn't update members. Try again.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: detailKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });
}

export function useRemoveReportAssigneeMutation(reportId: string) {
  const queryClient = useQueryClient();
  const detailKey = queryKeys.reports.detail(reportId);

  return useMutation({
    mutationFn: (input: RemoveReportAssigneeInput) => removeReportAssignee(reportId, input),
    onMutate: async ({ agentId }) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<ReportDetail>(detailKey);
      queryClient.setQueryData<ReportDetail>(detailKey, (current) => {
        if (!current) return current;
        return patchDetailAssignees(
          current,
          current.report.assignees.filter((a) => a.agentId !== agentId),
        );
      });
      return { previous };
    },
    onSuccess: (report) => {
      queryClient.setQueryData<ReportDetail>(detailKey, (current) =>
        current ? { ...current, report } : current,
      );
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
      toast.error("Couldn't update members. Try again.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: detailKey });
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
