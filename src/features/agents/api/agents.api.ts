import { AGENTS } from "@/shared/constants/agent";
import { filterBySearch } from "@/shared/components/SearchToolbar";
import type { AgentProfile, AgentsQuery, PaginatedAgents } from "@/shared/types";

export async function getAgents(): Promise<AgentProfile[]> {
  return AGENTS;
}

export async function getAgentsPaginated(query: AgentsQuery): Promise<PaginatedAgents> {
  const { page, limit, search = "" } = query;

  let results = filterBySearch(AGENTS, search, (agent) =>
    [agent.name, agent.role, agent.handle, agent.shift].join(" "),
  );

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * limit;
  const data = results.slice(start, start + limit);

  return {
    data,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}
