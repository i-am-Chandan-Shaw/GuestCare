import { useQuery } from "@tanstack/react-query";
import { getCustomerSummaries, getPropertySummaries } from "@/features/customers/api/customers.api";
import { queryKeys } from "@/shared/lib/query-keys";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toAgentAccess } from "@/features/reports/lib/report-scope";

export function useCustomerSummaries() {
  const { agent } = useAuth();
  const currentAgent = toAgentAccess(agent);
  return useQuery({
    queryKey: [
      ...queryKeys.customers.summaries(),
      currentAgent?.id ?? "all",
      currentAgent?.role ?? "none",
      currentAgent?.customerScope?.type === "specific"
        ? currentAgent.customerScope.customerIds.join(",")
        : (currentAgent?.customerScope?.type ?? "none"),
    ],
    queryFn: () => getCustomerSummaries(),
  });
}

export function usePropertySummaries(customerId: string | null) {
  return useQuery({
    queryKey: queryKeys.properties.summaries(customerId ?? ""),
    queryFn: () => getPropertySummaries(customerId!),
    enabled: Boolean(customerId),
  });
}
