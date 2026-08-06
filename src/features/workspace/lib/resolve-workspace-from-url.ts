import { getCustomerById, getPropertyById } from "@/features/customers/api/customers.api";
import { getIssueById, getIssues } from "@/features/copilot/api/protocols.api";
import type { FormState } from "@/features/incidents/components/incident-form.types";
import type { WorkspaceChecklistState } from "@/features/workspace/context/workspace.types";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import type { WorkspaceSearch } from "@/features/workspace/lib/workspace-url";
import { getQueryClientRef } from "@/shared/lib/query-client-ref";
import { queryKeys } from "@/shared/lib/query-keys";
import type { Customer, Issue, Property } from "@/shared/types";

const emptyChecklistPatch: WorkspaceChecklistState = {
  checked: {},
  verificationChecked: {},
  outcome: null,
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
  getIssuesForProperty?: (propertyId: string) => Promise<Issue[]>;
};

function cachedGetCustomerById(id: string): Promise<Customer | null> {
  return getQueryClientRef().fetchQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => getCustomerById(id),
  });
}

function cachedGetPropertyById(id: string): Promise<Property | null> {
  return getQueryClientRef().fetchQuery({
    queryKey: [...queryKeys.properties.all, "detail", id],
    queryFn: () => getPropertyById(id),
  });
}

function cachedGetIssuesForProperty(propertyId: string): Promise<Issue[]> {
  return getQueryClientRef().fetchQuery({
    queryKey: [...queryKeys.issues.all, "byProperty", propertyId],
    queryFn: () => getIssues(propertyId),
  });
}

function cachedGetIssueById(issueId: string): Promise<Issue | null> {
  return getQueryClientRef().fetchQuery({
    queryKey: [...queryKeys.issues.all, "detail", issueId],
    queryFn: () => getIssueById(issueId),
  });
}

export const defaultWorkspaceEntityDeps: WorkspaceEntityDeps = {
  getCustomerById: cachedGetCustomerById,
  getPropertyById: cachedGetPropertyById,
  getIssueById: cachedGetIssueById,
  getIssuesForProperty: cachedGetIssuesForProperty,
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

  const propertyIssues = deps.getIssuesForProperty
    ? await deps.getIssuesForProperty(nextProperty.id)
    : null;
  const nextIssue = propertyIssues
    ? (propertyIssues.find((issue) => issue.id === search.issueId) ?? null)
    : await deps.getIssueById(search.issueId);

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
