import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCustomerSummaries,
  getCustomerSummary,
  getPropertySummaries,
} from "@/features/customers/api/customers.api";
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
