import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createIncident, getIncidentLogs } from "@/features/incidents/api/incidents.api";
import { getClientErrorMessage } from "@/shared/lib/client-error";
import { queryKeys } from "@/shared/lib/query-keys";
import type { CreateIncidentInput, IncidentLogFilters } from "@/shared/types";

function useInvalidateIncidentQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
  };
}

export function useIncidentLogs(filters: IncidentLogFilters = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.incidents.list(filters as Record<string, unknown>),
    queryFn: () => getIncidentLogs(filters),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateIncidentMutation(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateIncidentQueries();

  return useMutation({
    mutationFn: (input: CreateIncidentInput) => createIncident(input),
    onSuccess: () => {
      invalidate();
      toast.success("Report submitted");
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      toast.error(
        getClientErrorMessage(
          error,
          "Could not submit report. Check the required fields and try again.",
        ),
      );
    },
  });
}
