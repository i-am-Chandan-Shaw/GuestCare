import {
  createAgentFn,
  getAgentByIdFn,
  listAgentsFn,
  updateAgentFn,
} from "@/features/agents/agents.functions";
import { filterBySearch } from "@/shared/components/SearchToolbar";
import { formatCustomerScope } from "@/shared/lib/agent-display";
import type {
  Agent,
  AgentListItem,
  AgentsQuery,
  CreateAgentInput,
  PaginatedAgents,
  ReportActor,
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

/** `actor` kept for call-site / query-key compatibility; auth is enforced in listAgentsFn. */
export async function getAgents(_actor: ReportActor): Promise<Agent[]> {
  return listAgentsFn();
}

/** `actor` kept for call-site compatibility; auth is enforced in getAgentByIdFn. */
export async function getAgentById(id: string, _actor: ReportActor): Promise<Agent | null> {
  return getAgentByIdFn({ data: { id } });
}

export async function getAgentsPaginated(
  query: AgentsQuery,
  _actor: ReportActor,
): Promise<PaginatedAgents> {
  const { page, limit, search = "" } = query;
  const store = await listAgentsFn();

  let results = filterBySearch(store, search, (agent) =>
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

/** `actor` kept for call-site compatibility; auth/permissions enforced in updateAgentFn. */
export async function updateAgent(
  id: string,
  input: UpdateAgentInput,
  _actor: ReportActor,
): Promise<Agent> {
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
