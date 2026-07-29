import { useQuery } from "@tanstack/react-query";
import { getAgents } from "@/features/agents/api/agents.api";
import { queryKeys } from "@/shared/lib/query-keys";

export function useAgents() {
  return useQuery({
    queryKey: queryKeys.agents.all,
    queryFn: getAgents,
  });
}
