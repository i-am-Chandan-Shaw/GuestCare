import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { emptyForm, type FormState } from "@/features/incidents/components/incident-form.types";
import type { IncidentComposeContextValue } from "@/features/incidents/context/incident-compose.types";
import {
  getIncidentFormBaseline,
  isIncidentFormDirty,
} from "@/features/incidents/lib/incident-form-baseline";
import {
  openIncidentPipWindow,
  watchIncidentPipClosed,
} from "@/features/incidents/lib/incident-pip";
import {
  createIncidentWindowSync,
  isIncidentPopupWindow,
  openIncidentPopupWindow,
  type IncidentPanelMode,
  type IncidentWindowState,
  watchIncidentPopupClosed,
} from "@/features/incidents/lib/incident-window-sync";
import { useCreateIncidentMutation } from "@/features/incidents/hooks/useIncidents";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useWorkspaceContext } from "@/features/workspace/context/WorkspaceProvider";
import { syncFormFromIssue, syncNotesFromSteps } from "@/features/workspace/lib/workspace-state";

type IncidentComposeProviderProps = {
  children: ReactNode;
  syncRef: MutableRefObject<ReturnType<typeof createIncidentWindowSync>>;
};

const IncidentComposeContext = createContext<IncidentComposeContextValue | null>(null);

export function IncidentComposeProvider({ children, syncRef }: IncidentComposeProviderProps) {
  const workspace = useWorkspaceContext();
  const { agent } = useAuth();
  const { selection, checklist } = workspace.state;
  const { customer, property, issue } = selection;
  const { checked, outcome } = checklist;

  const isPopupWindow = isIncidentPopupWindow();
  const popupRef = useRef<Window | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const isRemoteUpdate = useRef(false);
  const formBroadcastTimer = useRef<number | null>(null);

  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [panelMode, setPanelMode] = useState<IncidentPanelMode>(
    isPopupWindow ? "detached" : "closed",
  );
  const [form, setFormState] = useState<FormState>(emptyForm);

  const buildSnapshot = useCallback(
    (overrides?: Partial<IncidentWindowState>): IncidentWindowState => ({
      form,
      phase: selection.phase,
      customerId: customer?.id ?? null,
      propertyId: property?.id ?? null,
      issueId: issue?.id ?? null,
      checked: checklist.checked,
      verificationChecked: checklist.verificationChecked,
      outcome: checklist.outcome,
      panelMode,
      detached: panelMode === "detached",
      ...overrides,
    }),
    [form, selection.phase, customer, property, issue, checklist, panelMode],
  );

  const broadcastPatch = useCallback(
    (patch: Partial<IncidentWindowState>) => {
      if (isRemoteUpdate.current) return;
      syncRef.current.post({ type: "SYNC_PATCH", patch });
    },
    [syncRef],
  );

  const broadcastFull = useCallback(
    (overrides?: Partial<IncidentWindowState>) => {
      if (isRemoteUpdate.current) return;
      syncRef.current.post({ type: "SYNC_FULL", snapshot: buildSnapshot(overrides) });
    },
    [buildSnapshot, syncRef],
  );

  const setForm = useCallback(
    (next: FormState) => {
      setFormState(next);
      if (isRemoteUpdate.current) return;
      if (formBroadcastTimer.current) window.clearTimeout(formBroadcastTimer.current);
      formBroadcastTimer.current = window.setTimeout(() => {
        broadcastPatch({ form: next });
      }, 120);
    },
    [broadcastPatch],
  );

  const closeDetachedWindow = useCallback(() => {
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
    }
    pipWindowRef.current = null;
    setPipWindow(null);

    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
  }, []);

  const clearComposeState = useCallback(() => {
    closeDetachedWindow();
    setFormState(emptyForm());
    setPanelMode("closed");
  }, [closeDetachedWindow]);

  const handleSubmitSuccess = useCallback(() => {
    clearComposeState();
    syncRef.current.post({ type: "SUBMIT_SUCCESS" });
    workspace.actions.resetAfterSubmit();
    if (isPopupWindow) {
      window.close();
    }
  }, [clearComposeState, isPopupWindow, syncRef, workspace.actions]);

  const createIncident = useCreateIncidentMutation({ onSuccess: handleSubmitSuccess });

  const attachIncidentPanel = useCallback(() => {
    closeDetachedWindow();
    setPanelMode("expanded");
    syncRef.current.post({ type: "ATTACH" });
    broadcastFull({ panelMode: "expanded", detached: false });
  }, [broadcastFull, closeDetachedWindow, syncRef]);

  const detachIncidentPanel = useCallback(() => {
    if (panelMode === "detached") {
      attachIncidentPanel();
      return;
    }

    void (async () => {
      try {
        const pip = await openIncidentPipWindow();
        pipWindowRef.current = pip;
        setPipWindow(pip);
        setPanelMode("detached");

        watchIncidentPipClosed(pip, () => {
          pipWindowRef.current = null;
          setPipWindow(null);
          if (isPopupWindow) return;
          setPanelMode((mode) => (mode === "detached" ? "expanded" : mode));
        });
        return;
      } catch {
        // Fall back to popup when PiP is unavailable.
      }

      const popup = openIncidentPopupWindow();
      if (!popup) return;

      popupRef.current = popup;
      setPanelMode("detached");
      syncRef.current.post({ type: "DETACH" });
      broadcastFull({ panelMode: "detached", detached: true });

      watchIncidentPopupClosed(popup, () => {
        popupRef.current = null;
        if (isPopupWindow) return;
        setPanelMode("expanded");
        syncRef.current.post({ type: "ATTACH" });
      });
    })();
  }, [attachIncidentPanel, broadcastFull, isPopupWindow, panelMode, syncRef]);

  const clearForm = useCallback(() => {
    workspace.actions.resetChecklist();
    const nextForm = getIncidentFormBaseline(issue);
    setFormState(nextForm);
    broadcastPatch({
      form: nextForm,
      checked: {},
      verificationChecked: {},
      outcome: null,
    });
  }, [broadcastPatch, issue, workspace.actions]);

  const openIncidentPanel = useCallback(
    (mode: Exclude<IncidentPanelMode, "closed"> = "expanded") => {
      setPanelMode(mode);
      broadcastPatch({ panelMode: mode, detached: mode === "detached" });
    },
    [broadcastPatch],
  );

  const closeIncidentPanel = useCallback(() => {
    if (panelMode === "detached" && !isPopupWindow) {
      closeDetachedWindow();
    }
    setPanelMode("closed");
    broadcastPatch({ panelMode: "closed", detached: false });
    if (isPopupWindow) {
      window.close();
    }
  }, [broadcastPatch, closeDetachedWindow, isPopupWindow, panelMode]);

  const minimizeIncidentPanel = useCallback(() => {
    setPanelMode("minimized");
    broadcastPatch({ panelMode: "minimized", detached: false });
  }, [broadcastPatch]);

  const expandIncidentPanel = useCallback(() => {
    setPanelMode("expanded");
    broadcastPatch({ panelMode: "expanded", detached: false });
  }, [broadcastPatch]);

  const submitIncident = useCallback(() => {
    createIncident.mutate({
      callerName: form.callerName,
      callerContact: form.callerContact,
      reservation: form.reservation,
      nameOnBooking: form.nameOnBooking,
      incidentType: form.incidentType,
      issueSummary: form.issueSummary,
      actions: form.actions,
      priority: form.priority,
      status: form.status,
      callNotes: form.callNotes,
      customerId: customer?.id,
      propertyId: property?.id,
      propertyLabel: property?.name,
      protocolIssueId: issue?.id,
      agentName: agent.name,
      submittedBy: agent.handle,
    });
  }, [createIncident, form, customer, property, issue, agent]);

  useEffect(() => {
    if (!issue) return;
    setFormState((current) => syncFormFromIssue(current, issue));
  }, [issue]);

  useEffect(() => {
    if (!issue) return;
    setFormState((current) => syncNotesFromSteps(current, issue, checked));
  }, [checked, issue]);

  useEffect(() => {
    if (!outcome) return;
    setFormState((current) => ({
      ...current,
      status: outcome === "resolve" ? "Resolved" : "Unresolved - Escalation Handover",
    }));
  }, [outcome]);

  const applyRemotePatch = useCallback(
    async (patch: Partial<IncidentWindowState>) => {
      isRemoteUpdate.current = true;
      try {
        if (patch.form !== undefined) setFormState(patch.form);
        if (patch.panelMode !== undefined) setPanelMode(patch.panelMode);
        await workspace.actions.applyRemotePatch({
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
    [workspace.actions],
  );

  const applyRemoteSnapshot = useCallback(
    async (snapshot: IncidentWindowState) => {
      isRemoteUpdate.current = true;
      try {
        setFormState(snapshot.form);
        setPanelMode(snapshot.panelMode);
        await workspace.actions.applyRemoteSnapshot({
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
    [workspace.actions],
  );

  const applyRemotePatchRef = useRef(applyRemotePatch);
  const applyRemoteSnapshotRef = useRef(applyRemoteSnapshot);
  const buildSnapshotRef = useRef(buildSnapshot);
  const closeDetachedWindowRef = useRef(closeDetachedWindow);
  const clearComposeStateRef = useRef(clearComposeState);

  useEffect(() => {
    applyRemotePatchRef.current = applyRemotePatch;
  }, [applyRemotePatch]);
  useEffect(() => {
    applyRemoteSnapshotRef.current = applyRemoteSnapshot;
  }, [applyRemoteSnapshot]);
  useEffect(() => {
    buildSnapshotRef.current = buildSnapshot;
  }, [buildSnapshot]);
  useEffect(() => {
    closeDetachedWindowRef.current = closeDetachedWindow;
  }, [closeDetachedWindow]);
  useEffect(() => {
    clearComposeStateRef.current = clearComposeState;
  }, [clearComposeState]);

  useEffect(() => {
    const sync = syncRef.current;
    const unsubscribe = sync.subscribe((message) => {
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
        if (!isPopupWindow) {
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
        workspace.actions.resetAfterSubmit();
      }
    });

    if (isPopupWindow) {
      sync.post({ type: "REQUEST_FULL" });
    }

    return () => {
      unsubscribe();
    };
  }, [isPopupWindow, syncRef, workspace.actions]);

  const isDetached = panelMode === "detached";
  const formDirty = isIncidentFormDirty(form, issue);

  const value = useMemo(
    (): IncidentComposeContextValue => ({
      state: { form, panelMode, pipWindow },
      actions: {
        setForm,
        clearForm,
        openIncidentPanel,
        closeIncidentPanel,
        minimizeIncidentPanel,
        expandIncidentPanel,
        detachIncidentPanel,
        attachIncidentPanel,
        submitIncident,
      },
      meta: {
        isPopupWindow,
        isSubmitting: createIncident.isPending,
        isIncidentFormDirty: formDirty,
        isDetached,
      },
    }),
    [
      form,
      panelMode,
      pipWindow,
      setForm,
      clearForm,
      openIncidentPanel,
      closeIncidentPanel,
      minimizeIncidentPanel,
      expandIncidentPanel,
      detachIncidentPanel,
      attachIncidentPanel,
      submitIncident,
      isPopupWindow,
      createIncident.isPending,
      formDirty,
      isDetached,
    ],
  );

  return (
    <IncidentComposeContext.Provider value={value}>{children}</IncidentComposeContext.Provider>
  );
}

/** Incident panel UI: form state, PiP window, and submit. */
export function useIncidentCompose() {
  const ctx = use(IncidentComposeContext);
  if (!ctx) {
    throw new Error("useIncidentCompose must be used within IncidentComposeProvider.");
  }

  const { state, actions, meta } = ctx;

  return { state, actions, meta };
}
