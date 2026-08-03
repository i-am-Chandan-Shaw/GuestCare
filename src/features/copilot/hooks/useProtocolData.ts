import { useQuery } from "@tanstack/react-query";
import {
  fetchGlobalContact,
  getIssues,
} from "@/features/copilot/api/protocols.api";
import { queryKeys } from "@/shared/lib/query-keys";

export function useIssues() {
  return useQuery({
    queryKey: queryKeys.issues.all,
    queryFn: getIssues,
  });
}

export function useGlobalContact(contactId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.contacts.detail(contactId ?? ""),
    queryFn: () => fetchGlobalContact(contactId!),
    enabled: Boolean(contactId),
  });
}
