import type { Customer, Issue, Property } from "@/shared/types";
import type { WorkspacePhase } from "./workspace-state";

export type WorkspaceSearch = {
  customerId?: string;
  propertyId?: string;
  issueId?: string;
};

export function workspaceSearchFromState({
  phase,
  customer,
  property,
  issue,
}: {
  phase: WorkspacePhase;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
}): WorkspaceSearch {
  if (phase === "browse" || !customer) return {};

  if (phase === "customer") {
    return { customerId: customer.id };
  }

  if (!property) {
    return { customerId: customer.id };
  }

  if (phase === "property" || !issue) {
    return { customerId: customer.id, propertyId: property.id };
  }

  return {
    customerId: customer.id,
    propertyId: property.id,
    issueId: issue.id,
  };
}
