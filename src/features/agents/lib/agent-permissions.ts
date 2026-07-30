import { CUSTOMERS } from "@/data/mocks/customers.mock";
import { agentCanAccessCustomer } from "@/features/reports/lib/report-scope";
import type {
  Agent,
  AgentCustomerScope,
  AgentRole,
  ReportActor,
} from "@/shared/types/agent";

export function canManageAgents(actor: ReportActor): boolean {
  return actor.role === "admin" || actor.role === "manager";
}

export function creatableRoles(actor: ReportActor): AgentRole[] {
  if (actor.role === "admin") return ["admin", "manager", "user"];
  if (actor.role === "manager") return ["user"];
  return [];
}

export function canGrantAllCustomers(actor: ReportActor): boolean {
  if (actor.role === "admin") return true;
  if (actor.role === "manager" && actor.customerScope.type === "all") return true;
  return false;
}

/** Customers the actor is allowed to assign to another agent. */
export function assignableCustomerIds(actor: ReportActor): string[] {
  if (actor.role === "admin" || actor.customerScope.type === "all") {
    return CUSTOMERS.map((c) => c.id);
  }
  return [...actor.customerScope.customerIds];
}

export function canEditAgent(actor: ReportActor, target: Pick<Agent, "id" | "role">): boolean {
  if (!canManageAgents(actor)) return false;
  if (actor.role === "admin") return true;
  // Managers may only edit users (not admins/managers), including not elevating via role UI.
  return target.role === "user";
}

export function validateCustomerScopeForActor(
  actor: ReportActor,
  scope: AgentCustomerScope,
): string | null {
  if (scope.type === "all") {
    if (!canGrantAllCustomers(actor)) {
      return "You cannot grant access to all customers.";
    }
    return null;
  }

  if (scope.customerIds.length === 0) {
    return "Select at least one customer, or choose All customers.";
  }

  const allowed = new Set(assignableCustomerIds(actor));
  const invalid = scope.customerIds.filter((id) => !allowed.has(id));
  if (invalid.length > 0) {
    return "One or more selected customers are outside your access.";
  }

  return null;
}

export function actorCanAccessCustomerId(actor: ReportActor, customerId: string): boolean {
  return agentCanAccessCustomer(actor, customerId);
}
