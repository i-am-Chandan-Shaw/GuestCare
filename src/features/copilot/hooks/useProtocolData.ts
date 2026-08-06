import { useQuery } from "@tanstack/react-query";
import { fetchGlobalContact, getIssues } from "@/features/copilot/api/protocols.api";
import { queryKeys } from "@/shared/lib/query-keys";

export function useIssues(propertyId?: string | null) {
  return useQuery({
    queryKey: [...queryKeys.issues.all, propertyId ?? "none"],
    queryFn: () => getIssues(propertyId ?? undefined),
    enabled: Boolean(propertyId),
  });
}

export function useGlobalContact(
  contactId: string | undefined,
  customerId?: string | null,
) {
  return useQuery({
    queryKey: [...queryKeys.contacts.detail(contactId ?? ""), customerId ?? ""],
    queryFn: () => fetchGlobalContact(contactId!, customerId ?? undefined),
    enabled: Boolean(contactId),
  });
}
