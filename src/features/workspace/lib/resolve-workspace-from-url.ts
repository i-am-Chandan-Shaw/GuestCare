import { getCustomerById, getPropertyById } from "@/features/customers/api/customers.api";
import { getIssueById } from "@/features/copilot/api/protocols.api";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import type { WorkspaceSearch } from "@/features/workspace/lib/workspace-url";
import type { Customer, Issue, Property } from "@/shared/types";

const emptyChecklistPatch = {
  checked: {} as Record<string, boolean>,
  verificationChecked: {} as Record<string, boolean>,
  outcome: null as "resolve" | "escalate" | null,
};

export type WorkspaceSyncPatch = {
  customerId?: string | null;
  propertyId?: string | null;
  issueId?: string | null;
  phase?: WorkspacePhase;
  checked?: Record<string, boolean>;
  verificationChecked?: Record<string, boolean>;
  outcome?: "resolve" | "escalate" | null;
  form?: FormState;
};

export type WorkspaceResolution = {
  phase: WorkspacePhase;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  syncPatch: WorkspaceSyncPatch;
};

export type WorkspaceEntityDeps = {
  getCustomerById: (id: string) => Promise<Customer | null>;
  getPropertyById: (id: string) => Promise<Property | null>;
  getIssueById: (id: string) => Promise<Issue | null>;
};

export const defaultWorkspaceEntityDeps: WorkspaceEntityDeps = {
  getCustomerById,
  getPropertyById,
  getIssueById,
};

function browseResolution(): WorkspaceResolution {
  return {
    phase: "browse",
    customer: null,
    property: null,
    issue: null,
    syncPatch: {
      customerId: null,
      propertyId: null,
      issueId: null,
      phase: "browse",
      ...emptyChecklistPatch,
    },
  };
}

export async function resolveWorkspaceFromUrl(
  search: WorkspaceSearch,
  deps: WorkspaceEntityDeps = defaultWorkspaceEntityDeps,
): Promise<WorkspaceResolution> {
  if (!search.customerId) {
    return browseResolution();
  }

  const nextCustomer = await deps.getCustomerById(search.customerId);
  if (!nextCustomer) {
    return browseResolution();
  }

  if (!search.propertyId) {
    return {
      phase: "customer",
      customer: nextCustomer,
      property: null,
      issue: null,
      syncPatch: {
        customerId: nextCustomer.id,
        propertyId: null,
        issueId: null,
        phase: "customer",
        ...emptyChecklistPatch,
      },
    };
  }

  const nextProperty = await deps.getPropertyById(search.propertyId);
  if (!nextProperty || !nextCustomer.propertyIds.includes(nextProperty.id)) {
    return {
      phase: "customer",
      customer: nextCustomer,
      property: null,
      issue: null,
      syncPatch: {
        customerId: nextCustomer.id,
        propertyId: null,
        issueId: null,
        phase: "customer",
        ...emptyChecklistPatch,
      },
    };
  }

  if (!search.issueId) {
    return {
      phase: "property",
      customer: nextCustomer,
      property: nextProperty,
      issue: null,
      syncPatch: {
        customerId: nextCustomer.id,
        propertyId: nextProperty.id,
        issueId: null,
        phase: "property",
        ...emptyChecklistPatch,
      },
    };
  }

  const [nextIssue] = await Promise.all([deps.getIssueById(search.issueId)]);

  if (!nextIssue) {
    return {
      phase: "property",
      customer: nextCustomer,
      property: nextProperty,
      issue: null,
      syncPatch: {
        customerId: nextCustomer.id,
        propertyId: nextProperty.id,
        issueId: null,
        phase: "property",
        ...emptyChecklistPatch,
      },
    };
  }

  return {
    phase: "protocol",
    customer: nextCustomer,
    property: nextProperty,
    issue: nextIssue,
    syncPatch: {
      customerId: nextCustomer.id,
      propertyId: nextProperty.id,
      issueId: nextIssue.id,
      phase: "protocol",
      ...emptyChecklistPatch,
    },
  };
}
