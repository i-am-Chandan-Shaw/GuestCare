import { useQuery } from "@tanstack/react-query";
import { getAgents } from "@/features/agents/api/agents.api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toReportActor } from "@/features/reports/lib/report-scope";
import { queryKeys } from "@/shared/lib/query-keys";

export function useAgents() {
  const { agent } = useAuth();
  const actor = toReportActor(agent);

  return useQuery({
    queryKey: [...queryKeys.agents.all, actor.id],
    queryFn: () => getAgents(actor),
  });
}
