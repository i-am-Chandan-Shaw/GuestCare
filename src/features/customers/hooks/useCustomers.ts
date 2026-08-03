import { useQuery } from "@tanstack/react-query";
import {
  getCustomerSummaries,
  getPropertySummaries,
} from "@/features/customers/api/customers.api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { ReportActor } from "@/shared/types/agent";

export function useCustomerSummaries(actor?: ReportActor) {
  return useQuery({
    queryKey: [
      ...queryKeys.customers.summaries(),
      actor?.id ?? "all",
      actor?.role ?? "none",
      actor?.customerScope?.type === "specific"
        ? actor.customerScope.customerIds.join(",")
        : actor?.customerScope?.type ?? "none",
    ],
    queryFn: () => getCustomerSummaries(actor),
  });
}

export function usePropertySummaries(customerId: string | null) {
  return useQuery({
    queryKey: queryKeys.properties.summaries(customerId ?? ""),
    queryFn: () => getPropertySummaries(customerId!),
    enabled: Boolean(customerId),
  });
}
