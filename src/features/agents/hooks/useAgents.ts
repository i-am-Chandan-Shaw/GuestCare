import { useQuery } from "@tanstack/react-query";
import { getAgents } from "@/features/agents/api/agents.api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toAgentAccess } from "@/features/reports/lib/report-scope";
import { queryKeys } from "@/shared/lib/query-keys";

export function useAgents() {
  const { agent } = useAuth();
  const currentAgent = toAgentAccess(agent);

  return useQuery({
    queryKey: [...queryKeys.agents.all, currentAgent.id],
    queryFn: () => getAgents(currentAgent),
  });
}
