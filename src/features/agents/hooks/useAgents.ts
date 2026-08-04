import { useQuery } from "@tanstack/react-query";
import { getAgents } from "@/features/agents/api/agents.api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { queryKeys } from "@/shared/lib/query-keys";

export function useAgents() {
  const { agent } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.agents.all, agent.id],
    queryFn: () => getAgents(),
  });
}
