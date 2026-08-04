import { createAgentFn, listAgentsFn, updateAgentFn } from "@/features/agents/agents.functions";
import { filterBySearch } from "@/shared/components/SearchToolbar";
import { formatCustomerScope } from "@/shared/lib/agent-display";
import type {
  Agent,
  AgentListItem,
  AgentsQuery,
  CreateAgentInput,
  PaginatedAgents,
  UpdateAgentInput,
} from "@/shared/types/agent";

function toListItem(agent: Agent): AgentListItem {
  return {
    id: agent.id,
    name: agent.name,
    email: agent.email,
    role: agent.role,
    isActive: agent.isActive,
    customerScope: agent.customerScope,
    customerScopeLabel: formatCustomerScope(agent.customerScope),
    imageUrl: agent.imageUrl,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}

export async function getAgents(): Promise<Agent[]> {
  return listAgentsFn();
}

export async function getAgentsPaginated(query: AgentsQuery): Promise<PaginatedAgents> {
  const { page, limit, search = "" } = query;
  const agents = await listAgentsFn();

  let results = filterBySearch(agents, search, (agent) =>
    [agent.name, agent.email, agent.role, formatCustomerScope(agent.customerScope)].join(" "),
  );

  results = [...results].sort((a, b) => a.name.localeCompare(b.name));

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * limit;

  return {
    data: results.slice(start, start + limit).map(toListItem),
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  };
}

export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  return createAgentFn({ data: input });
}

export async function updateAgent(id: string, input: UpdateAgentInput): Promise<Agent> {
  return updateAgentFn({
    data: {
      id,
      name: input.name,
      email: input.email,
      role: input.role,
      isActive: input.isActive,
      customerScope: input.customerScope,
      password: input.password,
    },
  });
}
