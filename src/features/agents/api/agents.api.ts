import {
  canEditAgent,
  canManageAgents,
  creatableRoles,
  validateCustomerScopeForActor,
} from "@/features/agents/lib/agent-permissions";
import {
  findAgentByEmail,
  findAgentById,
  insertAgent,
  listAgents,
  patchAgent,
} from "@/features/agents/lib/agent-store";
import { isPasswordStrong } from "@/features/agents/validations/agent-form.schema";
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

const WEAK_PASSWORD_ERROR =
  "Password must be 8+ characters with uppercase, number, and special character.";

function toListItem(agent: Agent): AgentListItem {
  return {
    id: agent.id,
    name: agent.name,
    email: agent.email,
    role: agent.role,
    isActive: agent.isActive,
    customerScopeLabel: formatCustomerScope(agent.customerScope),
    imageUrl: agent.imageUrl,
    createdAt: agent.createdAt,
  };
}

function assertCanReadAgents(actor: ReportActor): void {
  if (!canManageAgents(actor)) {
    throw new Error("You do not have permission to view agents.");
  }
}

export async function getAgents(actor: ReportActor): Promise<Agent[]> {
  assertCanReadAgents(actor);
  return listAgents();
}

export async function getAgentById(id: string, actor: ReportActor): Promise<Agent | null> {
  assertCanReadAgents(actor);
  return findAgentById(id) ?? null;
}

export async function getAgentsPaginated(
  query: AgentsQuery,
  actor: ReportActor,
): Promise<PaginatedAgents> {
  assertCanReadAgents(actor);
  const { page, limit, search = "" } = query;
  const store = listAgents();

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

export async function createAgent(input: CreateAgentInput, actor: ReportActor): Promise<Agent> {
  if (!canManageAgents(actor)) {
    throw new Error("You do not have permission to create agents.");
  }

  const allowedRoles = creatableRoles(actor);
  if (!allowedRoles.includes(input.role)) {
    throw new Error("You cannot create an agent with that role.");
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();

  if (!name) throw new Error("Name is required.");
  if (!email || !email.includes("@")) throw new Error("A valid email is required.");
  if (!isPasswordStrong(password)) {
    throw new Error(WEAK_PASSWORD_ERROR);
  }

  const scopeError = validateCustomerScopeForActor(actor, input.customerScope);
  if (scopeError) throw new Error(scopeError);

  if (findAgentByEmail(email)) {
    throw new Error("An agent with this email already exists.");
  }

  return await insertAgent({
    ...input,
    name,
    email,
    password,
    isActive: input.isActive ?? true,
  });
}

export async function updateAgent(
  id: string,
  input: UpdateAgentInput,
  actor: ReportActor,
): Promise<Agent> {
  const target = findAgentById(id);
  if (!target) throw new Error("Agent not found.");

  if (!canEditAgent(actor, target)) {
    throw new Error("You do not have permission to edit this agent.");
  }

  const allowedRoles = creatableRoles(actor);
  if (!allowedRoles.includes(input.role)) {
    throw new Error("You cannot assign that role.");
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();

  if (!name) throw new Error("Name is required.");
  if (!email || !email.includes("@")) throw new Error("A valid email is required.");

  if (actor.id === id) {
    if (input.role !== target.role) {
      throw new Error("You cannot change your own role.");
    }
    if (!input.isActive) {
      throw new Error("You cannot deactivate your own account.");
    }
  }

  const scopeError = validateCustomerScopeForActor(actor, input.customerScope);
  if (scopeError) throw new Error(scopeError);

  const emailOwner = findAgentByEmail(email);
  if (emailOwner && emailOwner.id !== id) {
    throw new Error("An agent with this email already exists.");
  }

  const password = input.password?.trim();
  if (password && !isPasswordStrong(password)) {
    throw new Error(WEAK_PASSWORD_ERROR);
  }

  const updated = await patchAgent(id, {
    ...input,
    name,
    email,
    password: password || undefined,
  });

  if (!updated) throw new Error("Agent not found.");
  return updated;
}
