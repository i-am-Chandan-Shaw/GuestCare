import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getCustomerSummaries, getCustomerSummary, getPropertySummaries } from "@/features/customers/api/customers.api";
import { queryKeys } from "@/shared/lib/query-keys";

export function useCustomerSummaries() {
  return useQuery({
    queryKey: queryKeys.customers.summaries(),
    queryFn: getCustomerSummaries,
  });
}

export function useCustomerSummary(customerId: string | null) {
  return useQuery({
    queryKey: queryKeys.customers.detail(customerId ?? ""),
    queryFn: () => getCustomerSummary(customerId!),
    enabled: Boolean(customerId),
  });
}

export function usePropertySummaries(customerId: string | null) {
  return useQuery({
    queryKey: queryKeys.properties.summaries(customerId ?? ""),
    queryFn: () => getPropertySummaries(customerId!),
    enabled: Boolean(customerId),
  });
}

export function useInvalidateCustomerQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
  };
}

export function useCreateIncidentMutation(options?: { onSuccess?: () => void }) {
  const invalidate = useInvalidateCustomerQueries();

  return useMutation({
    mutationFn: async (input: Parameters<typeof import("@/features/incidents/api/incidents.api").createIncident>[0]) => {
      const { createIncident } = await import("@/features/incidents/api/incidents.api");
      return createIncident(input);
    },
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
