import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addReportComment,
  assignReport,
  getAgentsForAssignment,
  getReportById,
  getReportsPaginated,
  updateReport,
} from "@/features/reports/api/reports.api";
import { toReportActor } from "@/features/reports/lib/report-scope";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type {
  AddReportCommentInput,
  AssignReportInput,
  ReportsQuery,
  UpdateReportInput,
} from "@/shared/types/report";

export function useReportActor() {
  const { agent } = useAuth();
  return useMemo(() => toReportActor(agent), [agent]);
}

export function useReportsPaginatedQuery(query: ReportsQuery) {
  const actor = useReportActor();
  return useQuery({
    queryKey: ["reports", query, actor.id],
    queryFn: () => getReportsPaginated(query, actor),
  });
}

export function useReportDetailQuery(reportId: string | null) {
  const actor = useReportActor();
  return useQuery({
    queryKey: ["report", reportId, actor.id],
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
      void queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useAssignReportMutation(reportId: string) {
  const actor = useReportActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignReportInput) => assignReport(reportId, input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useAddReportCommentMutation(reportId: string) {
  const actor = useReportActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddReportCommentInput) => addReportComment(reportId, input, actor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      void queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
