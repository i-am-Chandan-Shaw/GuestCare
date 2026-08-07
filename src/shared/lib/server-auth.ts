/**
 * Shared server-side authentication and authorization helpers.
 *
 * Extracted from workspace.functions.ts and reports.functions.ts
 * where they were duplicated identically.
 */
import { getAuthSession } from "@/features/auth/server/session";
import { throwHttpError } from "@/shared/lib/server-fn-error";
import { agentCanAccessCustomer } from "@/shared/lib/access";
import type { AgentAccess } from "@/shared/types/agent";
import { canManageAgents } from "@/features/agents/lib/agent-permissions";

/** Require a valid session or throw 401. */
export async function requireSession() {
  const session = await getAuthSession();
  if (!session) throwHttpError("You must be signed in.", 401);
  return session;
}

/** Require a valid session and directory manager permission or throw 401/403. */
export async function requireDirectoryManager() {
  const session = await requireSession();
  if (!canManageAgents(session.agent)) {
    throwHttpError("You do not have permission to manage the directory.", 403);
  }
  return session;
}

/**
 * Return the explicit customer IDs this agent is scoped to,
 * or `null` if the agent has access to all customers.
 */
export function scopedCustomerIds(agent: AgentAccess): string[] | null {
  if (agent.role === "admin") return null;
  if (!agent.customerScope || agent.customerScope.type === "all") return null;
  return agent.customerScope.customerIds;
}

/** Throw 403 if the agent does not have access to the given customer. */
export function assertCustomerAccess(agent: AgentAccess, customerId: string) {
  if (!agentCanAccessCustomer(agent, customerId)) {
    throwHttpError("You do not have access to this customer.", 403);
  }
}
