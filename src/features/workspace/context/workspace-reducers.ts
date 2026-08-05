import type {
  WorkspaceChecklistState,
  WorkspaceSelectionState,
} from "@/features/workspace/context/workspace.types";
import type { Customer, Issue, Property } from "@/shared/types";

export type SelectionAction =
  | { type: "SET"; payload: WorkspaceSelectionState }
  | {
      type: "PATCH";
      payload: Partial<WorkspaceSelectionState> & {
        customer?: Customer | null;
        property?: Property | null;
        issue?: Issue | null;
      };
    };

export function selectionReducer(
  state: WorkspaceSelectionState,
  action: SelectionAction,
): WorkspaceSelectionState {
  if (action.type === "SET") return action.payload;
  return { ...state, ...action.payload };
}

export type ChecklistAction =
  | { type: "SET"; payload: WorkspaceChecklistState }
  | { type: "RESET" }
  | { type: "PATCH"; payload: Partial<WorkspaceChecklistState> };

export const emptyChecklist: WorkspaceChecklistState = {
  checked: {},
  verificationChecked: {},
  outcome: null,
};

export function checklistReducer(
  state: WorkspaceChecklistState,
  action: ChecklistAction,
): WorkspaceChecklistState {
  if (action.type === "SET") return action.payload;
  if (action.type === "RESET") return emptyChecklist;
  return { ...state, ...action.payload };
}
