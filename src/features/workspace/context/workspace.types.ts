import type { Customer, Issue, Property } from "@/shared/types";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import type { WorkspaceSearch } from "@/features/workspace/lib/workspace-url";

export interface WorkspaceSelectionState {
  phase: WorkspacePhase;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
}

export interface WorkspaceChecklistState {
  checked: Record<string, boolean>;
  verificationChecked: Record<string, boolean>;
  outcome: "resolve" | "escalate" | null;
}

export interface WorkspaceStateSlice {
  selection: WorkspaceSelectionState;
  checklist: WorkspaceChecklistState;
}

export interface WorkspaceActions {
  selectCustomer: (next: Customer) => void;
  selectProperty: (next: Property) => void;
  selectIssue: (next: Issue) => void;
  changeCustomer: () => void;
  changeProperty: () => void;
  changeIssue: () => void;
  hydrateFromSearch: (search: WorkspaceSearch) => Promise<void>;
  resetAfterSubmit: () => void;
  toggleStep: (id: string) => void;
  toggleVerification: (id: string) => void;
  setOutcome: (outcome: "resolve" | "escalate") => void;
}

export interface WorkspaceContextValue {
  state: WorkspaceStateSlice;
  actions: WorkspaceActions;
}
