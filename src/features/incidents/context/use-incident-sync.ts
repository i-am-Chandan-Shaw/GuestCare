import { useEffect, useRef, useCallback } from "react";
import {
  type IncidentSyncMessage,
  type IncidentWindowState,
  type IncidentWindowSync,
} from "@/features/incidents/lib/incident-window-sync";
import type { WorkspaceActions } from "@/features/workspace/context/workspace-actions";
import type { FormState } from "@/features/incidents/components/incident-form.types";
import type { IncidentPanelMode } from "@/features/incidents/lib/incident-window-sync";

export function useIncidentSync({
  syncRef,
  isPopupWindow,
  setFormState,
  setPanelMode,
  workspaceActions,
  buildSnapshot,
  closeDetachedWindow,
  clearComposeState,
}: {
  syncRef: React.MutableRefObject<IncidentWindowSync | null>;
  isPopupWindow: boolean;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  setPanelMode: React.Dispatch<React.SetStateAction<IncidentPanelMode>>;
  workspaceActions: WorkspaceActions;
  buildSnapshot: (overrides?: Partial<IncidentWindowState>) => IncidentWindowState;
  closeDetachedWindow: () => void;
  clearComposeState: () => void;
}) {
  const isRemoteUpdate = useRef(false);

  const applyRemotePatch = useCallback(
    async (patch: Partial<IncidentWindowState>) => {
      isRemoteUpdate.current = true;
      try {
        if (patch.form !== undefined) setFormState(patch.form);
        if (patch.panelMode !== undefined) setPanelMode(patch.panelMode);
        await workspaceActions.applyRemotePatch({
          phase: patch.phase,
          customerId: patch.customerId,
          propertyId: patch.propertyId,
          issueId: patch.issueId,
          checked: patch.checked,
          verificationChecked: patch.verificationChecked,
          outcome: patch.outcome,
        });
      } finally {
        isRemoteUpdate.current = false;
      }
    },
    [workspaceActions, setFormState, setPanelMode],
  );

  const applyRemoteSnapshot = useCallback(
    async (snapshot: IncidentWindowState) => {
      isRemoteUpdate.current = true;
      try {
        setFormState(snapshot.form);
        setPanelMode(snapshot.panelMode);
        await workspaceActions.applyRemoteSnapshot({
          phase: snapshot.phase,
          customerId: snapshot.customerId,
          propertyId: snapshot.propertyId,
          issueId: snapshot.issueId,
          checked: snapshot.checked,
          verificationChecked: snapshot.verificationChecked,
          outcome: snapshot.outcome,
        });
      } finally {
        isRemoteUpdate.current = false;
      }
    },
    [workspaceActions, setFormState, setPanelMode],
  );

  const applyRemotePatchRef = useRef(applyRemotePatch);
  const applyRemoteSnapshotRef = useRef(applyRemoteSnapshot);
  const buildSnapshotRef = useRef(buildSnapshot);
  const closeDetachedWindowRef = useRef(closeDetachedWindow);
  const clearComposeStateRef = useRef(clearComposeState);

  useEffect(() => {
    applyRemotePatchRef.current = applyRemotePatch;
    applyRemoteSnapshotRef.current = applyRemoteSnapshot;
    buildSnapshotRef.current = buildSnapshot;
    closeDetachedWindowRef.current = closeDetachedWindow;
    clearComposeStateRef.current = clearComposeState;
  }, [
    applyRemotePatch,
    applyRemoteSnapshot,
    buildSnapshot,
    closeDetachedWindow,
    clearComposeState,
  ]);

  useEffect(() => {
    const sync = syncRef.current;
    const unsubscribe = sync.subscribe((message: IncidentSyncMessage) => {
      if (message.type === "SYNC_FULL") {
        void applyRemoteSnapshotRef.current(message.snapshot);
        return;
      }
      if (message.type === "SYNC_PATCH") {
        void applyRemotePatchRef.current(message.patch);
        return;
      }
      if (message.type === "REQUEST_FULL") {
        if (!isPopupWindow) {
          sync.post({ type: "SYNC_FULL", snapshot: buildSnapshotRef.current() });
        }
        return;
      }
      if (message.type === "DETACH") {
        if (isPopupWindow) {
          setPanelMode("detached");
        }
        return;
      }
      if (message.type === "ATTACH") {
        if (isPopupWindow) {
          window.close();
          return;
        }
        setPanelMode("expanded");
        closeDetachedWindowRef.current();
        return;
      }
      if (message.type === "SUBMIT_SUCCESS") {
        if (isPopupWindow) {
          window.close();
          return;
        }
        closeDetachedWindowRef.current();
        clearComposeStateRef.current();
        workspaceActions.resetAfterSubmit();
      }
    });

    if (isPopupWindow) {
      sync.post({ type: "REQUEST_FULL" });
    }

    return () => {
      unsubscribe();
    };
  }, [isPopupWindow, syncRef, workspaceActions, setPanelMode]);

  return { isRemoteUpdate };
}
