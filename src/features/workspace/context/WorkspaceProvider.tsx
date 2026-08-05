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
import type {
  WorkspaceActions,
  WorkspaceChecklistState,
  WorkspaceSelectionState,
} from "@/features/workspace/context/workspace.types";
import {
  clearPersistedWorkspace,
  writePersistedWorkspace,
} from "@/features/workspace/lib/workspace-persistence";
import {
  selectionReducer,
  checklistReducer,
  emptyChecklist,
} from "@/features/workspace/context/workspace-reducers";
import {
  useWorkspaceSync,
  type WorkspaceRemoteSnapshot,
} from "@/features/workspace/context/workspace-sync";
import { useWorkspaceHydration } from "@/features/workspace/context/workspace-hydration";
import { useWorkspaceActions } from "@/features/workspace/context/workspace-actions";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import type { WorkspaceSyncPatch } from "@/features/workspace/lib/resolve-workspace-from-url";

export type { WorkspacePhase };

type WorkspaceInternalActions = WorkspaceActions & {
  resetChecklist: () => void;
  applyRemotePatch: (patch: WorkspaceSyncPatch & { phase?: WorkspacePhase }) => Promise<void>;
  applyRemoteSnapshot: (snapshot: WorkspaceRemoteSnapshot) => Promise<void>;
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

  const [selection, dispatchSelection] = useReducer(selectionReducer, {
    phase: "browse",
    customer: null,
    property: null,
    issue: null,
  });

  const [checklist, dispatchChecklist] = useReducer(checklistReducer, emptyChecklist);

  const { isRemoteUpdate, applyRemotePatch, applyRemoteSnapshot } = useWorkspaceSync({
    selection,
    dispatchSelection,
    dispatchChecklist,
  });

  const broadcastPatch = useCallback((patch: WorkspaceSyncPatch) => {
    if (isRemoteUpdate.current) return;
    syncRef.current.post({ type: "SYNC_PATCH", patch });
  }, []);

  const { hydrateFromSearch } = useWorkspaceHydration({
    selection,
    dispatchSelection,
    dispatchChecklist,
    broadcastPatch,
    applyRemoteSnapshot,
  });

  const actionsFns = useWorkspaceActions({
    dispatchSelection,
    dispatchChecklist,
    broadcastPatch,
    checklist,
  });

  const actions = useMemo(
    (): WorkspaceInternalActions => ({
      ...actionsFns,
      hydrateFromSearch,
      applyRemotePatch,
      applyRemoteSnapshot,
    }),
    [actionsFns, hydrateFromSearch, applyRemotePatch, applyRemoteSnapshot],
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

export function useWorkspaceContext() {
  const ctx = use(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider.");
  }
  return ctx;
}
