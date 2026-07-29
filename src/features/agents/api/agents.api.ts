import { AGENT_SEED } from "@/data/agents.seed";
import { filterBySearch } from "@/shared/components/SearchToolbar";
import { formatAgentRole, formatCustomerScope } from "@/shared/lib/agent-display";
import type { Agent, AgentListItem, AgentsQuery, PaginatedAgents } from "@/shared/types/agent";

export async function getAgents(): Promise<Agent[]> {
  return AGENT_SEED;
}

export async function getAgentsPaginated(query: AgentsQuery): Promise<PaginatedAgents> {
  const { page, limit, search = "" } = query;

  let results = filterBySearch(AGENT_SEED, search, (agent) =>
    [agent.name, agent.email, agent.role, formatCustomerScope(agent.customerScope)].join(" "),
  );

  results = [...results].sort((a, b) => a.name.localeCompare(b.name));

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * limit;

  const data: AgentListItem[] = results.slice(start, start + limit).map((agent) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email,
    role: agent.role,
    isActive: agent.isActive,
    customerScopeLabel: formatCustomerScope(agent.customerScope),
    createdAt: agent.createdAt,
  }));

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

export { formatAgentRole };
