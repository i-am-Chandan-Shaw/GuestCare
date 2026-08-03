import type { ReportActor } from "@/shared/types/agent";

export function agentCanAccessCustomer(actor: ReportActor, customerId: string): boolean {
  if (actor.role === "admin") return true;
  if (!actor.customerScope) return true;
  if (actor.customerScope.type === "all") return true;
  return actor.customerScope.customerIds.includes(customerId);
}
