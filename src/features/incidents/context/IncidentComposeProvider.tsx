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
import { isIncidentFormDirty } from "@/features/incidents/lib/incident-form-baseline";
import {
  createIncidentWindowSync,
  isIncidentPopupWindow,
  type IncidentPanelMode,
  type IncidentWindowState,
} from "@/features/incidents/lib/incident-window-sync";
import { useCreateIncidentMutation } from "@/features/incidents/hooks/useIncidents";
import { useWorkspaceContext } from "@/features/workspace/context/WorkspaceProvider";
import {
  clearPersistedCompose,
  readPersistedCompose,
  writePersistedCompose,
} from "@/features/workspace/lib/workspace-persistence";
import { syncFormFromIssue } from "@/features/workspace/lib/workspace-state";
import { useIncidentActions } from "@/features/incidents/context/use-incident-actions";
import { useIncidentSync } from "@/features/incidents/context/use-incident-sync";

type IncidentComposeProviderProps = {
  children: ReactNode;
  syncRef: MutableRefObject<ReturnType<typeof createIncidentWindowSync>>;
};

const IncidentComposeContext = createContext<IncidentComposeContextValue | null>(null);

export function IncidentComposeProvider({ children, syncRef }: IncidentComposeProviderProps) {
  const workspace = useWorkspaceContext();
  const { selection, checklist } = workspace.state;
  const { customer, property, issue } = selection;
  const { outcome } = checklist;

  const isPopupWindow = isIncidentPopupWindow();
  const popupRef = useRef<Window | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const formBroadcastTimer = useRef<number | null>(null);

  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [panelMode, setPanelMode] = useState<IncidentPanelMode>(() => {
    if (isIncidentPopupWindow()) return "detached";
    return readPersistedCompose()?.panelMode ?? "closed";
  });
  const [form, setFormState] = useState<FormState>(
    () => readPersistedCompose()?.form ?? emptyForm(),
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
    clearPersistedCompose();
  }, [closeDetachedWindow]);

  const handleSubmitSuccess = useCallback(() => {
    clearComposeState();
    syncRef.current.post({ type: "SUBMIT_SUCCESS" });
    workspace.actions.resetAfterSubmit();
    if (isPopupWindow) {
      window.close();
    }
  }, [clearComposeState, isPopupWindow, syncRef, workspace.actions]);

  useEffect(() => {
    const flagKey = "gc_cleared_autofill_notes_v1";
    try {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(flagKey)) return;
      sessionStorage?.setItem(flagKey, "1");
    } catch {
      /* private mode */
    }
    setFormState((current) => {
      if (!current.callNotes && current.actions.length === 0) return current;
      return { ...current, callNotes: "", actions: [] };
    });
  }, []);

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

  const createIncident = useCreateIncidentMutation({
    onSuccess: () => handleSubmitSuccess(),
  });

  const {
    setForm,
    attachIncidentPanel,
    detachIncidentPanel,
    clearForm,
    openIncidentPanel,
    closeIncidentPanel,
    minimizeIncidentPanel,
    expandIncidentPanel,
    submitIncident,
  } = useIncidentActions({
    form,
    setFormState,
    panelMode,
    setPanelMode,
    pipWindowRef,
    setPipWindow,
    popupRef,
    isPopupWindow,
    customer: customer ?? null,
    property: property ?? null,
    issue: issue ?? null,
    syncRef,
    workspaceActions: workspace.actions,
    broadcastPatch: (patch: Partial<IncidentWindowState>) => {
      if (isRemoteUpdate.current) return;
      syncRef.current.post({ type: "SYNC_PATCH", patch });
    },
    broadcastFull: (overrides?: Partial<IncidentWindowState>) => {
      if (isRemoteUpdate.current) return;
      syncRef.current.post({ type: "SYNC_FULL", snapshot: buildSnapshot(overrides) });
    },
    formBroadcastTimer,
    createIncidentMutate: createIncident.mutate,
    closeDetachedWindow,
  });

  const { isRemoteUpdate } = useIncidentSync({
    syncRef,
    isPopupWindow,
    setFormState,
    setPanelMode,
    workspaceActions: workspace.actions,
    buildSnapshot,
    closeDetachedWindow,
    clearComposeState,
  });

  useEffect(() => {
    if (!issue) return;
    setFormState((current) => syncFormFromIssue(current, issue));
  }, [issue]);

  useEffect(() => {
    if (!outcome) return;
    setFormState((current) => ({
      ...current,
      status: outcome === "resolve" ? "Resolved" : "Unresolved - Escalation Handover",
    }));
  }, [outcome]);

  useEffect(() => {
    if (panelMode !== "detached") return;

    const pipAlive = pipWindowRef.current && !pipWindowRef.current.closed;
    const popupAlive = popupRef.current && !popupRef.current.closed;

    if (!pipAlive && !popupAlive) {
      pipWindowRef.current = null;
      popupRef.current = null;
      setPipWindow(null);
      setPanelMode("closed");
    }
  }, [panelMode, pipWindow]);

  useEffect(() => {
    if (isPopupWindow) return;
    writePersistedCompose({ form, panelMode });
  }, [form, panelMode, isPopupWindow]);

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

function useIncidentComposeContext() {
  const ctx = use(IncidentComposeContext);
  if (!ctx) {
    throw new Error("useIncidentCompose must be used within IncidentComposeProvider.");
  }
  return ctx;
}

export function useIncidentCompose() {
  return useIncidentComposeContext();
}

export function useIncidentComposeActions() {
  return useIncidentComposeContext().actions;
}
