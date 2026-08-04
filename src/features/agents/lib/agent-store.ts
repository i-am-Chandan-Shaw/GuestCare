import { AGENT_DEV_PASSWORD_HASHES, AGENT_SEED } from "@/mock-data/agents.seed";
import { hashPassword } from "@/features/auth/lib/password";
import { nowIso } from "@/shared/lib/datetime";
import type {
  Agent,
  AgentCustomerScope,
  CreateAgentInput,
  UpdateAgentInput,
} from "@/shared/types/agent";

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

const agentStore: Agent[] = AGENT_SEED.map(cloneAgent);
const passwordHashStore: Record<string, string> = { ...AGENT_DEV_PASSWORD_HASHES };
let agentIdCounter = AGENT_SEED.length + 1;

export function listAgents(): Agent[] {
  return agentStore.map(cloneAgent);
}

export function findAgentById(id: string): Agent | undefined {
  const agent = agentStore.find((a) => a.id === id);
  return agent ? cloneAgent(agent) : undefined;
}

export function findAgentByEmail(email: string): Agent | undefined {
  const normalized = email.trim().toLowerCase();
  const agent = agentStore.find((a) => a.email.toLowerCase() === normalized);
  return agent ? cloneAgent(agent) : undefined;
}

export function findAgentByName(name: string): Agent | undefined {
  const agent = agentStore.find((a) => a.name === name);
  return agent ? cloneAgent(agent) : undefined;
}

export function getAgentPasswordHash(agentId: string): string | undefined {
  return passwordHashStore[agentId];
}

export async function setAgentPassword(agentId: string, password: string): Promise<void> {
  passwordHashStore[agentId] = await hashPassword(password);
}

function nextAgentId(): string {
  const id = `agent-${agentIdCounter}`;
  agentIdCounter += 1;
  return id;
}

export async function insertAgent(input: CreateAgentInput): Promise<Agent> {
  const now = nowIso();
  const agent: Agent = {
    id: nextAgentId(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    isActive: input.isActive ?? true,
    customerScope: cloneScope(input.customerScope),
    createdAt: now,
    updatedAt: now,
  };
  agentStore.push(agent);
  passwordHashStore[agent.id] = await hashPassword(input.password);
  return cloneAgent(agent);
}

export async function patchAgent(id: string, input: UpdateAgentInput): Promise<Agent | null> {
  const index = agentStore.findIndex((a) => a.id === id);
  if (index < 0) return null;

  const current = agentStore[index]!;
  const updated: Agent = {
    ...current,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    isActive: input.isActive,
    customerScope: cloneScope(input.customerScope),
    updatedAt: nowIso(),
  };
  agentStore[index] = updated;

  if (input.password && input.password.trim()) {
    passwordHashStore[id] = await hashPassword(input.password);
  }

  return cloneAgent(updated);
}
