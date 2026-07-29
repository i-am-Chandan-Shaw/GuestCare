import type { Agent, AgentCustomerScope } from "@/shared/types/agent";

export function getAgentInitials(agent: Pick<Agent, "name">): string {
  const parts = agent.name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return agent.name.slice(0, 2).toUpperCase();
}

export function getAgentHandle(agent: Pick<Agent, "email"> & { handle?: string }): string {
  if (agent.email) {
    const local = agent.email.split("@")[0] ?? agent.email;
    return `@${local}`;
  }
  if (agent.handle) return agent.handle;
  return "@agent";
}

export function formatCustomerScope(scope: AgentCustomerScope): string {
  if (scope.type === "all") return "All customers";
  return `${scope.customerIds.length} customer${scope.customerIds.length === 1 ? "" : "s"}`;
}

export function formatAgentRole(role: Agent["role"]): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
