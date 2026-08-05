import { AGENT_SEED } from "@/mock-data/agents.seed";
import type { Agent, AgentCustomerScope } from "@/shared/types/agent";

function cloneScope(scope: AgentCustomerScope): AgentCustomerScope {
  if (scope.type === "all") return { type: "all" };
  return { type: "specific", customerIds: [...scope.customerIds] };
}

function cloneAgent(agent: Agent): Agent {
  return {
    ...agent,
    customerScope: cloneScope(agent.customerScope),
  };
}

/** Read-only seed store — still used by mock reports. Agents CRUD is Supabase. */
const agentStore: Agent[] = AGENT_SEED.map(cloneAgent);

export function listAgents(): Agent[] {
  return agentStore.map(cloneAgent);
}

export function findAgentById(id: string): Agent | undefined {
  const agent = agentStore.find((a) => a.id === id);
  return agent ? cloneAgent(agent) : undefined;
}

export function findAgentByName(name: string): Agent | undefined {
  const agent = agentStore.find((a) => a.name === name);
  return agent ? cloneAgent(agent) : undefined;
}
