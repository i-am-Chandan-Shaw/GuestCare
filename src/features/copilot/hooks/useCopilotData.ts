import { useQuery } from "@tanstack/react-query";
import { getCustomers, getPropertiesByCustomerId, getPropertyById } from "@/features/copilot/api/copilot.api";
import {
  fetchGlobalContact,
  getIssues,
  getRecentIssueIds,
  getSuggestedIssues,
} from "@/features/copilot/api/protocols.api";
import { getIncidentLogs } from "@/features/incidents/api/incidents.api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { IncidentLogFilters, Issue } from "@/shared/types";

export function useCustomersList() {
  return useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: getCustomers,
  });
}

export function useProperties(customerId: string | null) {
  return useQuery({
    queryKey: queryKeys.properties.byCustomer(customerId ?? ""),
    queryFn: () => getPropertiesByCustomerId(customerId!),
    enabled: Boolean(customerId),
  });
}

export function useProperty(propertyId: string | null) {
  return useQuery({
    queryKey: [...queryKeys.properties.all, propertyId],
    queryFn: () => getPropertyById(propertyId!),
    enabled: Boolean(propertyId),
  });
}

export function useIssues() {
  return useQuery({
    queryKey: queryKeys.issues.all,
    queryFn: getIssues,
  });
}

export function useRecentIssues() {
  return useQuery({
    queryKey: queryKeys.issues.recent(),
    queryFn: async (): Promise<Issue[]> => {
      const [ids, issues] = await Promise.all([getRecentIssueIds(), getIssues()]);
      return ids
        .map((id) => issues.find((issue) => issue.id === id))
        .filter((issue): issue is Issue => Boolean(issue));
    },
  });
}

export function useGlobalContact(contactId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.contacts.detail(contactId ?? ""),
    queryFn: () => fetchGlobalContact(contactId!),
    enabled: Boolean(contactId),
  });
}

export function useSuggestedIssues(propertyId: string | null) {
  return useQuery({
    queryKey: queryKeys.issues.suggested(propertyId ?? ""),
    queryFn: () => getSuggestedIssues(propertyId!),
    enabled: Boolean(propertyId),
  });
}

export function useIncidentLogs(filters: IncidentLogFilters = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.incidents.list(filters),
    queryFn: () => getIncidentLogs(filters),
    enabled: options?.enabled ?? true,
  });
}
