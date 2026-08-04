import type { AgentAccess } from "@/shared/types/agent";

export function agentCanAccessCustomer(currentAgent: AgentAccess, customerId: string): boolean {
  if (currentAgent.role === "admin") return true;
  if (!currentAgent.customerScope) return true;
  if (currentAgent.customerScope.type === "all") return true;
  return currentAgent.customerScope.customerIds.includes(customerId);
}
