import { useCallback } from "react";
import type { Customer, Issue, Property } from "@/shared/types";
import type { WorkspaceSyncPatch } from "@/features/workspace/lib/resolve-workspace-from-url";
import { clearPersistedWorkspace } from "@/features/workspace/lib/workspace-persistence";
import type {
  SelectionAction,
  ChecklistAction,
} from "@/features/workspace/context/workspace-reducers";
import type { WorkspaceChecklistState } from "@/features/workspace/context/workspace.types";

export function useWorkspaceActions({
  dispatchSelection,
  dispatchChecklist,
  broadcastPatch,
  checklist,
}: {
  dispatchSelection: React.Dispatch<SelectionAction>;
  dispatchChecklist: React.Dispatch<ChecklistAction>;
  broadcastPatch: (patch: WorkspaceSyncPatch) => void;
  checklist: WorkspaceChecklistState;
}) {
  const resetChecklist = useCallback(() => {
    dispatchChecklist({ type: "RESET" });
  }, [dispatchChecklist]);

  const resetAfterSubmit = useCallback(() => {
    dispatchSelection({
      type: "SET",
      payload: { phase: "browse", customer: null, property: null, issue: null },
    });
    dispatchChecklist({ type: "RESET" });
    clearPersistedWorkspace();
  }, [dispatchSelection, dispatchChecklist]);

  const selectCustomer = useCallback(
    (next: Customer) => {
      dispatchSelection({
        type: "SET",
        payload: {
          phase: "customer",
          customer: next,
          property: null,
          issue: null,
        },
      });
      dispatchChecklist({ type: "RESET" });
      broadcastPatch({
        customerId: next.id,
        propertyId: null,
        issueId: null,
        phase: "customer",
        checked: {},
        verificationChecked: {},
        outcome: null,
      });
    },
    [dispatchSelection, dispatchChecklist, broadcastPatch],
  );

  const selectProperty = useCallback(
    (next: Property) => {
      dispatchSelection({
        type: "PATCH",
        payload: { property: next, issue: null, phase: "property" },
      });
      dispatchChecklist({ type: "RESET" });
      broadcastPatch({
        propertyId: next.id,
        issueId: null,
        phase: "property",
        checked: {},
        verificationChecked: {},
        outcome: null,
      });
    },
    [dispatchSelection, dispatchChecklist, broadcastPatch],
  );

  const selectIssue = useCallback(
    (next: Issue) => {
      dispatchSelection({
        type: "PATCH",
        payload: { issue: next, phase: "protocol" },
      });
      dispatchChecklist({ type: "RESET" });
      broadcastPatch({
        issueId: next.id,
        phase: "protocol",
        checked: {},
        verificationChecked: {},
        outcome: null,
      });
    },
    [dispatchSelection, dispatchChecklist, broadcastPatch],
  );

  const changeCustomer = useCallback(() => {
    dispatchSelection({
      type: "SET",
      payload: { phase: "browse", customer: null, property: null, issue: null },
    });
    clearPersistedWorkspace();
    broadcastPatch({
      customerId: null,
      propertyId: null,
      issueId: null,
      phase: "browse",
    });
  }, [dispatchSelection, broadcastPatch]);

  const changeProperty = useCallback(() => {
    dispatchSelection({
      type: "PATCH",
      payload: { property: null, issue: null, phase: "customer" },
    });
    dispatchChecklist({ type: "RESET" });
    broadcastPatch({
      propertyId: null,
      issueId: null,
      phase: "customer",
      checked: {},
      verificationChecked: {},
      outcome: null,
    });
  }, [dispatchSelection, dispatchChecklist, broadcastPatch]);

  const changeIssue = useCallback(() => {
    dispatchSelection({
      type: "PATCH",
      payload: { issue: null, phase: "property" },
    });
    dispatchChecklist({ type: "RESET" });
    broadcastPatch({
      issueId: null,
      phase: "property",
      checked: {},
      verificationChecked: {},
      outcome: null,
    });
  }, [dispatchSelection, dispatchChecklist, broadcastPatch]);

  const toggleStep = useCallback(
    (id: string) => {
      const next = { ...checklist.checked, [id]: !checklist.checked[id] };
      dispatchChecklist({ type: "PATCH", payload: { checked: next } });
      broadcastPatch({ checked: next });
    },
    [dispatchChecklist, broadcastPatch, checklist.checked],
  );

  const toggleVerification = useCallback(
    (id: string) => {
      const next = { ...checklist.verificationChecked, [id]: !checklist.verificationChecked[id] };
      dispatchChecklist({ type: "PATCH", payload: { verificationChecked: next } });
      broadcastPatch({ verificationChecked: next });
    },
    [dispatchChecklist, broadcastPatch, checklist.verificationChecked],
  );

  const setOutcome = useCallback(
    (next: "resolve" | "escalate") => {
      dispatchChecklist({ type: "PATCH", payload: { outcome: next } });
      broadcastPatch({ outcome: next });
    },
    [dispatchChecklist, broadcastPatch],
  );

  return {
    resetChecklist,
    resetAfterSubmit,
    selectCustomer,
    selectProperty,
    selectIssue,
    changeCustomer,
    changeProperty,
    changeIssue,
    toggleStep,
    toggleVerification,
    setOutcome,
  };
}
