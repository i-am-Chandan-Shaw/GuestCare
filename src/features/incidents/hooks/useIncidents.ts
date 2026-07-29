import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createIncident, getIncidentLogs } from "@/features/incidents/api/incidents.api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { CreateIncidentInput, IncidentLogFilters } from "@/shared/types";

function useInvalidateIncidentQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
  };
}

export function useIncidentLogs(filters: IncidentLogFilters = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.incidents.list(filters),
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
    onError: (error: Error) => {
      toast.error(error.message || "Could not submit report");
    },
  });
}
