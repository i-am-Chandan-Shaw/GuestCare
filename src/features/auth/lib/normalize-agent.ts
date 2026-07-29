import { AGENT_SEED, DEFAULT_AGENT_ID, findAgentByEmail, findAgentById } from "@/data/agents.seed";
import type { Agent, AgentCustomerScope, AgentRole } from "@/shared/types/agent";

type LegacyAgentProfile = {
  id?: string;
  name?: string;
  email?: string;
  handle?: string;
  role?: string;
};

const VALID_ROLES: AgentRole[] = ["admin", "manager", "user"];

function isValidRole(role: unknown): role is AgentRole {
  return typeof role === "string" && VALID_ROLES.includes(role as AgentRole);
}

function isValidScope(scope: unknown): scope is AgentCustomerScope {
  if (!scope || typeof scope !== "object") return false;
  const typed = scope as AgentCustomerScope;
  if (typed.type === "all") return true;
  return typed.type === "specific" && Array.isArray(typed.customerIds);
}

/** Upgrade legacy session payloads (AgentProfile cookies) to full Agent records. */
export function normalizeSessionAgent(raw: unknown): Agent | null {
  if (!raw || typeof raw !== "object") return null;

  const candidate = raw as Partial<Agent> & LegacyAgentProfile;
  const seedById = candidate.id ? findAgentById(candidate.id) : undefined;
  const emailFromHandle =
    candidate.handle?.startsWith("@") ? `${candidate.handle.slice(1)}@guestcare.com` : undefined;
  const email = candidate.email ?? emailFromHandle;
  const seedByEmail = email ? findAgentByEmail(email) : undefined;
  const seed = seedById ?? seedByEmail ?? findAgentById(DEFAULT_AGENT_ID);

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

export function normalizeReportActor(raw: unknown): Agent {
  return normalizeSessionAgent(raw) ?? AGENT_SEED.find((a) => a.id === DEFAULT_AGENT_ID)!;
}
