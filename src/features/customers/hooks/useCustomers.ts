import { useQuery } from "@tanstack/react-query";
import { getCustomerSummaries, getPropertySummaries } from "@/features/customers/api/customers.api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { AgentAccess } from "@/shared/types/agent";

export function useCustomerSummaries(currentAgent?: AgentAccess) {
  return useQuery({
    queryKey: [
      ...queryKeys.customers.summaries(),
      currentAgent?.id ?? "all",
      currentAgent?.role ?? "none",
      currentAgent?.customerScope?.type === "specific"
        ? currentAgent.customerScope.customerIds.join(",")
        : (currentAgent?.customerScope?.type ?? "none"),
    ],
    queryFn: () => getCustomerSummaries(currentAgent),
  });
}

export function usePropertySummaries(customerId: string | null) {
  return useQuery({
    queryKey: queryKeys.properties.summaries(customerId ?? ""),
    queryFn: () => getPropertySummaries(customerId!),
    enabled: Boolean(customerId),
  });
}
