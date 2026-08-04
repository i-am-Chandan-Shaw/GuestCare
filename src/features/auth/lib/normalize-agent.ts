import { findAgentByEmail, findAgentById } from "@/features/agents/lib/agent-store";
import type { Agent, AgentCustomerScope, AgentRole } from "@/shared/types/agent";

type LegacyAgentProfile = {
  id?: string;
  name?: string;
  email?: string;
  handle?: string;
  role?: string;
};

const VALID_ROLES: readonly string[] = ["admin", "manager", "user"];

function isValidRole(role: unknown): role is AgentRole {
  return typeof role === "string" && VALID_ROLES.includes(role);
}

function isValidScope(scope: unknown): scope is AgentCustomerScope {
  if (!scope || typeof scope !== "object") return false;
  const typed = scope as AgentCustomerScope;
  if (typed.type === "all") return true;
  return typed.type === "specific" && Array.isArray(typed.customerIds);
}

function isCompleteAgent(candidate: Partial<Agent> & { agentId?: string }): candidate is Agent {
  const id = candidate.agentId ?? candidate.id;
  return (
    typeof id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    isValidRole(candidate.role) &&
    typeof candidate.isActive === "boolean" &&
    isValidScope(candidate.customerScope)
  );
}

/**
 * Resolve session agent from a full AuthSession payload or legacy seed lookup.
 * Supabase agents are not in the mock store — complete payloads are used as-is.
 */
export function normalizeSessionAgent(raw: unknown): Agent | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Partial<Agent> & LegacyAgentProfile & { agentId?: string };
  const id = candidate.agentId ?? candidate.id;

  if (isCompleteAgent(candidate)) {
    return {
      id: id!,
      name: candidate.name,
      email: candidate.email,
      role: candidate.role,
      isActive: candidate.isActive,
      customerScope: candidate.customerScope,
      imageUrl: candidate.imageUrl,
      createdAt: candidate.createdAt ?? new Date(0).toISOString(),
      updatedAt: candidate.updatedAt ?? new Date(0).toISOString(),
    };
  }

  const emailFromHandle = candidate.handle?.startsWith("@")
    ? `${candidate.handle.slice(1)}@guestcare.com`
    : undefined;
  const email = candidate.email ?? emailFromHandle;
  const seedById = id ? findAgentById(id) : undefined;
  const seedByEmail = email ? findAgentByEmail(email) : undefined;
  return seedById ?? seedByEmail ?? null;
}

/** Resolve signed-in agent access fields from session/agent payload. Never invents a default. */
export function normalizeAgentAccess(raw: unknown): Agent {
  const agent = normalizeSessionAgent(raw);
  if (!agent) {
    throw new Error("Unable to resolve signed-in agent from session.");
  }
  return agent;
}
