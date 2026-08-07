import type { Agent, AgentCustomerScope, AgentRole, AgentAccess } from "@/shared/types/agent";

export function canManageAgents(currentAgent: AgentAccess): boolean {
  return currentAgent.role === "admin" || currentAgent.role === "manager";
}

export function creatableRoles(currentAgent: AgentAccess): AgentRole[] {
  if (currentAgent.role === "admin") return ["admin", "manager", "user"];
  return currentAgent.role === "manager" ? ["user"] : [];
}

export function canGrantAllCustomers(currentAgent: AgentAccess): boolean {
  return currentAgent.role === "admin" || (currentAgent.role === "manager" && currentAgent.customerScope.type === "all");
}

/**
 * Customers the signed-in agent may assign to another agent.
 * @param allCustomerIds — full list of customer IDs (from Supabase or the UI's loaded data).
 */
export function assignableCustomerIds(currentAgent: AgentAccess, allCustomerIds: string[]): string[] {
  if (currentAgent.role === "admin" || currentAgent.customerScope.type === "all") {
    return allCustomerIds;
  }
  return [...currentAgent.customerScope.customerIds];
}

export function canEditAgent(currentAgent: AgentAccess, target: Pick<Agent, "id" | "role">): boolean {
  if (!canManageAgents(currentAgent)) return false;
  if (currentAgent.role === "admin") return true;
  // Managers may only edit users (not admins/managers), including not elevating via role UI.
  return target.role === "user";
}

export function validateCustomerScope(
  currentAgent: AgentAccess,
  scope: AgentCustomerScope,
  allCustomerIds: string[],
): string | null {
  if (scope.type === "all") {
    if (!canGrantAllCustomers(currentAgent)) {
      return "You cannot grant access to all customers.";
    }
    return null;
  }

  if (scope.customerIds.length === 0) {
    return "Select at least one customer, or choose All customers.";
  }

  const allowed = new Set(assignableCustomerIds(currentAgent, allCustomerIds));
  const invalid = scope.customerIds.filter((id) => !allowed.has(id));
  if (invalid.length > 0) {
    return "One or more selected customers are outside your access.";
  }

  return null;
}
