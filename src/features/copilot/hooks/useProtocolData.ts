import { useQuery } from "@tanstack/react-query";
import {
  fetchGlobalContact,
  getIssues,
  getRecentIssueIds,
  getSuggestedIssues,
} from "@/features/copilot/api/protocols.api";
import { queryKeys } from "@/shared/lib/query-keys";
import type { Issue } from "@/shared/types";

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
