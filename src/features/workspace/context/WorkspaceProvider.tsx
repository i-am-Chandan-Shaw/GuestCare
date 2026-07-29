import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { IncidentComposeProvider } from "@/features/incidents/context/IncidentComposeProvider";
import { createIncidentWindowSync } from "@/features/incidents/lib/incident-window-sync";
import { type WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import {
  resolveWorkspaceFromUrl,
  type WorkspaceSyncPatch,
} from "@/features/workspace/lib/resolve-workspace-from-url";
import type { WorkspaceSearch } from "@/features/workspace/lib/workspace-url";
import {
  clearPersistedWorkspace,
  readPersistedWorkspace,
  writePersistedWorkspace,
} from "@/features/workspace/lib/workspace-persistence";
import type {
  WorkspaceActions,
  WorkspaceChecklistState,
  WorkspaceSelectionState,
} from "@/features/workspace/context/workspace.types";
import type { Customer, Issue, Property } from "@/shared/types";
import { getCustomerById, getPropertyById } from "@/features/customers/api/customers.api";
import { getIssueById } from "@/features/copilot/api/protocols.api";

export type { WorkspacePhase };

type SelectionAction =
  | { type: "SET"; payload: WorkspaceSelectionState }
  | {
      type: "PATCH";
      payload: Partial<WorkspaceSelectionState> & {
        customer?: Customer | null;
        property?: Property | null;
        issue?: Issue | null;
      };
    };

function selectionReducer(
  state: WorkspaceSelectionState,
  action: SelectionAction,
): WorkspaceSelectionState {
  if (action.type === "SET") return action.payload;
  return { ...state, ...action.payload };
}

type ChecklistAction =
  | { type: "SET"; payload: WorkspaceChecklistState }
  | { type: "RESET" }
  | { type: "PATCH"; payload: Partial<WorkspaceChecklistState> };

const emptyChecklist: WorkspaceChecklistState = {
  checked: {},
  verificationChecked: {},
  outcome: null,
};

function checklistReducer(
  state: WorkspaceChecklistState,
  action: ChecklistAction,
): WorkspaceChecklistState {
  if (action.type === "SET") return action.payload;
  if (action.type === "RESET") return emptyChecklist;
  return { ...state, ...action.payload };
}

type WorkspaceInternalActions = WorkspaceActions & {
  resetChecklist: () => void;
  applyRemotePatch: (patch: WorkspaceSyncPatch & { phase?: WorkspacePhase }) => Promise<void>;
  applyRemoteSnapshot: (snapshot: {
    phase: WorkspacePhase;
    customerId: string | null;
    propertyId: string | null;
    issueId: string | null;
    checked: Record<string, boolean>;
    verificationChecked: Record<string, boolean>;
    outcome: "resolve" | "escalate" | null;
  }) => Promise<void>;
};

type WorkspaceInternalContextValue = {
  state: {
    selection: WorkspaceSelectionState;
    checklist: WorkspaceChecklistState;
  };
  actions: WorkspaceInternalActions;
  broadcastPatch: (patch: WorkspaceSyncPatch) => void;
};

const WorkspaceContext = createContext<WorkspaceInternalContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const syncRef = useRef(createIncidentWindowSync());
  const isRemoteUpdate = useRef(false);

  const [selection, dispatchSelection] = useReducer(selectionReducer, {
    phase: "browse",
    customer: null,
    property: null,
    issue: null,
  });

  const [checklist, dispatchChecklist] = useReducer(checklistReducer, emptyChecklist);

  const broadcastPatch = useCallback((patch: WorkspaceSyncPatch) => {
    if (isRemoteUpdate.current) return;
    syncRef.current.post({ type: "SYNC_PATCH", patch });
  }, []);

  const resetChecklist = useCallback(() => {
    dispatchChecklist({ type: "RESET" });
  }, []);

  const resetAfterSubmit = useCallback(() => {
    dispatchSelection({
      type: "SET",
      payload: { phase: "browse", customer: null, property: null, issue: null },
    });
    dispatchChecklist({ type: "RESET" });
    clearPersistedWorkspace();
  }, []);

  const applyRemotePatch = useCallback(
    async (patch: WorkspaceSyncPatch & { phase?: WorkspacePhase }) => {
      isRemoteUpdate.current = true;
      try {
        if (patch.phase !== undefined) {
          dispatchSelection({ type: "PATCH", payload: { phase: patch.phase } });
        }

        if (patch.customerId !== undefined) {
          const nextCustomer = patch.customerId ? await getCustomerById(patch.customerId) : null;
          dispatchSelection({ type: "PATCH", payload: { customer: nextCustomer } });
        }

        if (patch.propertyId !== undefined) {
          const cid = patch.customerId ?? selection.customer?.id ?? null;
          const nextCustomer = cid ? await getCustomerById(cid) : null;
          const nextProperty =
            patch.propertyId && nextCustomer ? await getPropertyById(patch.propertyId) : null;
          dispatchSelection({ type: "PATCH", payload: { property: nextProperty } });
        }

        if (patch.issueId !== undefined) {
          const nextIssue = patch.issueId ? await getIssueById(patch.issueId) : null;
          dispatchSelection({ type: "PATCH", payload: { issue: nextIssue } });
        }

        if (
          patch.checked !== undefined ||
          patch.verificationChecked !== undefined ||
          patch.outcome !== undefined
        ) {
          dispatchChecklist({
            type: "PATCH",
            payload: {
              ...(patch.checked !== undefined ? { checked: patch.checked } : {}),
              ...(patch.verificationChecked !== undefined
                ? { verificationChecked: patch.verificationChecked }
                : {}),
              ...(patch.outcome !== undefined ? { outcome: patch.outcome } : {}),
            },
          });
        }
      } finally {
        isRemoteUpdate.current = false;
      }
    },
    [selection.customer?.id],
  );

  const applyRemoteSnapshot = useCallback(
    async (snapshot: {
      phase: WorkspacePhase;
      customerId: string | null;
      propertyId: string | null;
      issueId: string | null;
      checked: Record<string, boolean>;
      verificationChecked: Record<string, boolean>;
      outcome: "resolve" | "escalate" | null;
    }) => {
      isRemoteUpdate.current = true;
      try {
        const nextCustomer = snapshot.customerId
          ? await getCustomerById(snapshot.customerId)
          : null;

        const nextProperty =
          snapshot.propertyId && nextCustomer ? await getPropertyById(snapshot.propertyId) : null;

        const nextIssue = snapshot.issueId ? await getIssueById(snapshot.issueId) : null;

        dispatchSelection({
          type: "SET",
          payload: {
            phase: snapshot.phase,
            customer: nextCustomer,
            property: nextProperty,
            issue: nextIssue,
          },
        });

        dispatchChecklist({
          type: "SET",
          payload: {
            checked: snapshot.checked,
            verificationChecked: snapshot.verificationChecked,
            outcome: snapshot.outcome,
          },
        });
      } finally {
        isRemoteUpdate.current = false;
      }
    },
    [],
  );

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
    [broadcastPatch],
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
    [broadcastPatch],
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
    [broadcastPatch],
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
  }, [broadcastPatch]);

  const changeProperty = useCallback(() => {
    dispatchSelection({
      type: "PATCH",
      payload: { property: null, issue: null, phase: "customer" },
    });
    broadcastPatch({ propertyId: null, issueId: null, phase: "customer" });
  }, [broadcastPatch]);

  const changeIssue = useCallback(() => {
    dispatchSelection({
      type: "PATCH",
      payload: { issue: null, phase: "property" },
    });
    broadcastPatch({ issueId: null, phase: "property" });
  }, [broadcastPatch]);

  const hydrateFromSearch = useCallback(
    async (search: WorkspaceSearch) => {
      if (!search.customerId) {
        const persisted = readPersistedWorkspace();
        if (persisted?.customerId) {
          const matchesPersisted =
            selection.customer?.id === persisted.customerId &&
            (selection.property?.id ?? null) === persisted.propertyId &&
            (selection.issue?.id ?? null) === persisted.issueId &&
            selection.phase === persisted.phase;

          if (!matchesPersisted) {
            await applyRemoteSnapshot({
              phase: persisted.phase,
              customerId: persisted.customerId,
              propertyId: persisted.propertyId,
              issueId: persisted.issueId,
              checked: persisted.checked,
              verificationChecked: persisted.verificationChecked,
              outcome: persisted.outcome,
            });
          }
          return;
        }

        if (selection.customer) return;

        dispatchSelection({
          type: "SET",
          payload: { phase: "browse", customer: null, property: null, issue: null },
        });
        dispatchChecklist({ type: "RESET" });
        return;
      }

      const resolution = await resolveWorkspaceFromUrl(search);

      dispatchSelection({
        type: "SET",
        payload: {
          phase: resolution.phase,
          customer: resolution.customer,
          property: resolution.property,
          issue: resolution.issue,
        },
      });
      dispatchChecklist({ type: "RESET" });
      broadcastPatch(resolution.syncPatch);

      if (resolution.customer) {
        writePersistedWorkspace({
          phase: resolution.phase,
          customerId: resolution.customer.id,
          propertyId: resolution.property?.id ?? null,
          issueId: resolution.issue?.id ?? null,
          checked: {},
          verificationChecked: {},
          outcome: null,
        });
      }
    },
    [applyRemoteSnapshot, broadcastPatch, selection],
  );

  const toggleStep = useCallback(
    (id: string) => {
      dispatchChecklist({
        type: "PATCH",
        payload: {
          checked: { ...checklist.checked, [id]: !checklist.checked[id] },
        },
      });
      const next = { ...checklist.checked, [id]: !checklist.checked[id] };
      broadcastPatch({ checked: next });
    },
    [broadcastPatch, checklist.checked],
  );

  const toggleVerification = useCallback(
    (id: string) => {
      const next = { ...checklist.verificationChecked, [id]: !checklist.verificationChecked[id] };
      dispatchChecklist({ type: "PATCH", payload: { verificationChecked: next } });
      broadcastPatch({ verificationChecked: next });
    },
    [broadcastPatch, checklist.verificationChecked],
  );

  const setOutcome = useCallback(
    (next: "resolve" | "escalate") => {
      dispatchChecklist({ type: "PATCH", payload: { outcome: next } });
      broadcastPatch({ outcome: next });
    },
    [broadcastPatch],
  );

  const actions = useMemo(
    (): WorkspaceInternalActions => ({
      selectCustomer,
      selectProperty,
      selectIssue,
      changeCustomer,
      changeProperty,
      changeIssue,
      hydrateFromSearch,
      resetAfterSubmit,
      toggleStep,
      toggleVerification,
      setOutcome,
      resetChecklist,
      applyRemotePatch,
      applyRemoteSnapshot,
    }),
    [
      selectCustomer,
      selectProperty,
      selectIssue,
      changeCustomer,
      changeProperty,
      changeIssue,
      hydrateFromSearch,
      resetAfterSubmit,
      toggleStep,
      toggleVerification,
      setOutcome,
      resetChecklist,
      applyRemotePatch,
      applyRemoteSnapshot,
    ],
  );

  const value = useMemo(
    (): WorkspaceInternalContextValue => ({
      state: { selection, checklist },
      actions,
      broadcastPatch,
    }),
    [selection, checklist, actions, broadcastPatch],
  );

  useEffect(() => {
    if (!selection.customer) {
      if (selection.phase === "browse") {
        clearPersistedWorkspace();
      }
      return;
    }

    writePersistedWorkspace({
      phase: selection.phase,
      customerId: selection.customer.id,
      propertyId: selection.property?.id ?? null,
      issueId: selection.issue?.id ?? null,
      checked: checklist.checked,
      verificationChecked: checklist.verificationChecked,
      outcome: checklist.outcome,
    });
  }, [selection, checklist]);

  return (
    <WorkspaceContext.Provider value={value}>
      <IncidentComposeProvider syncRef={syncRef}>{children}</IncidentComposeProvider>
    </WorkspaceContext.Provider>
  );
}

/** Call flow: customer/property/issue selection and protocol checklist. */
export function useWorkspaceContext() {
  const ctx = use(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider.");
  }
  return ctx;
}

export { isIncidentFormDirty } from "@/features/incidents/lib/incident-form-baseline";
