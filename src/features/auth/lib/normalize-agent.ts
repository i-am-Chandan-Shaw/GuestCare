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

/**
 * Resolve session agent from slim cookie payload or legacy full-agent cookies.
 * Returns null when the agent cannot be found — never falls back to a default manager.
 */
export function normalizeSessionAgent(raw: unknown): Agent | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Partial<Agent> & LegacyAgentProfile & { agentId?: string };
  const id = candidate.agentId ?? candidate.id;
  const seedById = id ? findAgentById(id) : undefined;
  const emailFromHandle =
    candidate.handle?.startsWith("@") ? `${candidate.handle.slice(1)}@guestcare.com` : undefined;
  const email = candidate.email ?? emailFromHandle;
  const seedByEmail = email ? findAgentByEmail(email) : undefined;
  const seed = seedById ?? seedByEmail;

  if (!seed) return null;

  if (
    candidate.email &&
    candidate.name &&
    isValidRole(candidate.role) &&
    typeof candidate.isActive === "boolean" &&
    isValidScope(candidate.customerScope)
  ) {
    return {
      id: candidate.id ?? seed.id,
      name: candidate.name,
      email: candidate.email,
      role: candidate.role,
      isActive: candidate.isActive,
      customerScope: candidate.customerScope,
      createdAt: candidate.createdAt ?? seed.createdAt,
      updatedAt: candidate.updatedAt ?? seed.updatedAt,
    };
  }

  return seed;
}

/** Resolve a report actor from session/agent payload. Never invents a default manager. */
export function normalizeReportActor(raw: unknown): Agent {
  const agent = normalizeSessionAgent(raw);
  if (!agent) {
    throw new Error("Unable to resolve report actor from session.");
  }
  return agent;
}
