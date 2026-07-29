import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { emptyForm, type FormState } from "@/features/copilot/components";
import { getIssueById } from "@/features/copilot/api/protocols.api";
import { useCreateIncidentMutation } from "@/features/incidents/hooks/useIncidents";
import {
  syncFormFromIssue,
  syncNotesFromSteps,
  type WorkspacePhase,
} from "@/features/workspace/lib/workspace-state";
import type { WorkspaceSearch } from "@/features/workspace/lib/workspace-url";
import {
  openComposePipWindow,
  watchPipClosed,
} from "@/features/workspace/lib/compose-pip";
import {
  createWorkspaceSync,
  isComposePopupWindow,
  openComposePopup,
  watchPopupClosed,
  type ComposeMode,
  type WorkspaceSnapshot,
} from "@/features/workspace/lib/workspace-sync";
import { CUSTOMERS } from "@/data/mock";
import { PROPERTIES } from "@/data/properties";
import type { Customer, Issue, Property } from "@/shared/types";
import { protocolToIncidentType } from "@/shared/types";

export type { ComposeMode, WorkspacePhase };

function baselineForm(issue: Issue | null): FormState {
  return {
    ...emptyForm(),
    issueSummary: issue?.name ?? "",
    incidentType: issue ? protocolToIncidentType(issue.category) : "Other",
    priority: issue?.priority ?? "P2",
  };
}

export function isFormDirty(form: FormState, issue: Issue | null): boolean {
  return JSON.stringify(form) !== JSON.stringify(baselineForm(issue));
}

type WorkspaceContextValue = {
  phase: WorkspacePhase;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  checked: Record<string, boolean>;
  verificationChecked: Record<string, boolean>;
  outcome: "resolve" | "escalate" | null;
  form: FormState;
  composeMode: ComposeMode;
  isDetached: boolean;
  isPopupWindow: boolean;
  pipWindow: Window | null;
  isFormDirty: boolean;
  setForm: (f: FormState) => void;
  setOutcome: (o: "resolve" | "escalate") => void;
  setComposeMode: (mode: ComposeMode) => void;
  openCompose: (mode?: Exclude<ComposeMode, "closed">) => void;
  closeCompose: () => void;
  minimizeCompose: () => void;
  detachCompose: () => void;
  attachCompose: () => void;
  expandCompose: () => void;
  selectCustomer: (next: Customer) => void;
  selectProperty: (next: Property) => void;
  selectIssue: (next: Issue) => void;
  changeCustomer: () => void;
  changeProperty: () => void;
  changeIssue: () => void;
  hydrateFromSearch: (search: WorkspaceSearch) => Promise<void>;
  clearAll: () => void;
  clearForm: () => void;
  submitIncident: () => void;
  toggleStep: (id: string) => void;
  toggleVerification: (id: string) => void;
  isSubmitting: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const isPopupWindow = isComposePopupWindow();
  const syncRef = useRef(createWorkspaceSync());
  const popupRef = useRef<Window | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const isRemoteUpdate = useRef(false);
  const formBroadcastTimer = useRef<number | null>(null);

  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const [phase, setPhase] = useState<WorkspacePhase>("browse");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [verificationChecked, setVerificationChecked] = useState<Record<string, boolean>>({});
  const [outcome, setOutcome] = useState<"resolve" | "escalate" | null>(null);
  const [composeMode, setComposeMode] = useState<ComposeMode>(
    isPopupWindow ? "detached" : "closed",
  );
  const [form, setFormState] = useState<FormState>(emptyForm);

  const buildSnapshot = useCallback(
    (overrides?: Partial<WorkspaceSnapshot>): WorkspaceSnapshot => ({
      form,
      phase,
      customerId: customer?.id ?? null,
      propertyId: property?.id ?? null,
      issueId: issue?.id ?? null,
      checked,
      verificationChecked,
      outcome,
      composeMode,
      detached: composeMode === "detached",
      ...overrides,
    }),
    [form, phase, customer, property, issue, checked, verificationChecked, outcome, composeMode],
  );

  const broadcastPatch = useCallback(
    (patch: Partial<WorkspaceSnapshot>) => {
      if (isRemoteUpdate.current) return;
      syncRef.current.post({ type: "SYNC_PATCH", patch });
    },
    [],
  );

  const broadcastFull = useCallback(
    (overrides?: Partial<WorkspaceSnapshot>) => {
      if (isRemoteUpdate.current) return;
      syncRef.current.post({ type: "SYNC_FULL", snapshot: buildSnapshot(overrides) });
    },
    [buildSnapshot],
  );

  const applyPatch = useCallback(async (patch: Partial<WorkspaceSnapshot>) => {
    isRemoteUpdate.current = true;
    try {
      if (patch.form !== undefined) setFormState(patch.form);
      if (patch.phase !== undefined) setPhase(patch.phase);
      if (patch.checked !== undefined) setChecked(patch.checked);
      if (patch.verificationChecked !== undefined) setVerificationChecked(patch.verificationChecked);
      if (patch.outcome !== undefined) setOutcome(patch.outcome);
      if (patch.composeMode !== undefined) setComposeMode(patch.composeMode);

      if (patch.customerId !== undefined) {
        setCustomer(
          patch.customerId ? (CUSTOMERS.find((c) => c.id === patch.customerId) ?? null) : null,
        );
      }

      if (patch.propertyId !== undefined) {
        const cid = patch.customerId ?? customer?.id ?? null;
        const nextCustomer = cid ? (CUSTOMERS.find((c) => c.id === cid) ?? null) : null;
        setProperty(
          patch.propertyId && nextCustomer
            ? (PROPERTIES.find((p) => p.id === patch.propertyId) ?? null)
            : null,
        );
      }

      if (patch.issueId !== undefined) {
        if (patch.issueId) {
          setIssue(await getIssueById(patch.issueId));
        } else {
          setIssue(null);
        }
      }
    } finally {
      isRemoteUpdate.current = false;
    }
  }, [customer?.id]);

  const applySnapshot = useCallback(async (snapshot: WorkspaceSnapshot) => {
    isRemoteUpdate.current = true;
    try {
      setFormState(snapshot.form);
      setPhase(snapshot.phase);
      setChecked(snapshot.checked);
      setVerificationChecked(snapshot.verificationChecked);
      setOutcome(snapshot.outcome);
      setComposeMode(snapshot.composeMode);

      const nextCustomer = snapshot.customerId
        ? (CUSTOMERS.find((c) => c.id === snapshot.customerId) ?? null)
        : null;
      setCustomer(nextCustomer);

      const nextProperty =
        snapshot.propertyId && nextCustomer
          ? (PROPERTIES.find((p) => p.id === snapshot.propertyId) ?? null)
          : null;
      setProperty(nextProperty);

      if (snapshot.issueId) {
        const nextIssue = await getIssueById(snapshot.issueId);
        setIssue(nextIssue);
      } else {
        setIssue(null);
      }
    } finally {
      isRemoteUpdate.current = false;
    }
  }, []);

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

  const closePopupWindow = useCallback(() => {
    closeDetachedWindow();
  }, [closeDetachedWindow]);

  const clearAll = useCallback(() => {
    closePopupWindow();
    setPhase("browse");
    setCustomer(null);
    setProperty(null);
    setIssue(null);
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    setFormState(emptyForm());
    setComposeMode("closed");
    syncRef.current.post({ type: "SUBMIT_SUCCESS" });
    if (isPopupWindow) {
      window.close();
    }
  }, [closePopupWindow, isPopupWindow]);

  const createIncident = useCreateIncidentMutation({ onSuccess: clearAll });

  const attachCompose = useCallback(() => {
    closeDetachedWindow();
    setComposeMode("expanded");
    syncRef.current.post({ type: "ATTACH" });
    broadcastFull({ composeMode: "expanded", detached: false });
  }, [broadcastFull, closeDetachedWindow]);

  const detachCompose = useCallback(() => {
    if (composeMode === "detached") {
      attachCompose();
      return;
    }

    void (async () => {
      try {
        const pip = await openComposePipWindow();
        pipWindowRef.current = pip;
        setPipWindow(pip);
        setComposeMode("detached");

        watchPipClosed(pip, () => {
          pipWindowRef.current = null;
          setPipWindow(null);
          if (isPopupWindow) return;
          setComposeMode((mode) => (mode === "detached" ? "expanded" : mode));
        });
        return;
      } catch {
        // Fall back to a separate browser window when PiP is unavailable.
      }

      const popup = openComposePopup();
      if (!popup) return;

      popupRef.current = popup;
      setComposeMode("detached");
      syncRef.current.post({ type: "DETACH" });
      broadcastFull({ composeMode: "detached", detached: true });

      watchPopupClosed(popup, () => {
        popupRef.current = null;
        if (isPopupWindow) return;
        setComposeMode("expanded");
        syncRef.current.post({ type: "ATTACH" });
      });
    })();
  }, [attachCompose, broadcastFull, composeMode, isPopupWindow]);

  const selectCustomer = useCallback(
    (next: Customer) => {
      setCustomer(next);
      setProperty(null);
      setIssue(null);
      setChecked({});
      setVerificationChecked({});
      setOutcome(null);
      setPhase("customer");
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
      setProperty(next);
      setIssue(null);
      setChecked({});
      setVerificationChecked({});
      setOutcome(null);
      setPhase("property");
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
      setIssue(next);
      setFormState((current) => {
        const synced = syncFormFromIssue(current, next);
        broadcastPatch({
          issueId: next.id,
          phase: "protocol",
          checked: {},
          verificationChecked: {},
          outcome: null,
          form: synced,
        });
        return synced;
      });
      setChecked({});
      setVerificationChecked({});
      setOutcome(null);
      setPhase("protocol");
    },
    [broadcastPatch],
  );

  const changeCustomer = useCallback(() => {
    setCustomer(null);
    setProperty(null);
    setIssue(null);
    setPhase("browse");
    broadcastPatch({
      customerId: null,
      propertyId: null,
      issueId: null,
      phase: "browse",
    });
  }, [broadcastPatch]);

  const changeProperty = useCallback(() => {
    setProperty(null);
    setIssue(null);
    setPhase("customer");
    broadcastPatch({ propertyId: null, issueId: null, phase: "customer" });
  }, [broadcastPatch]);

  const changeIssue = useCallback(() => {
    setIssue(null);
    setPhase("property");
    broadcastPatch({ issueId: null, phase: "property" });
  }, [broadcastPatch]);

  const resetWorkspaceSelection = useCallback(() => {
    setPhase("browse");
    setCustomer(null);
    setProperty(null);
    setIssue(null);
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    broadcastPatch({
      customerId: null,
      propertyId: null,
      issueId: null,
      phase: "browse",
      checked: {},
      verificationChecked: {},
      outcome: null,
    });
  }, [broadcastPatch]);

  const hydrateFromSearch = useCallback(
    async (search: WorkspaceSearch) => {
      if (!search.customerId) {
        resetWorkspaceSelection();
        return;
      }

      const nextCustomer = CUSTOMERS.find((c) => c.id === search.customerId) ?? null;
      if (!nextCustomer) {
        resetWorkspaceSelection();
        return;
      }

      if (!search.propertyId) {
        setCustomer(nextCustomer);
        setProperty(null);
        setIssue(null);
        setChecked({});
        setVerificationChecked({});
        setOutcome(null);
        setPhase("customer");
        broadcastPatch({
          customerId: nextCustomer.id,
          propertyId: null,
          issueId: null,
          phase: "customer",
          checked: {},
          verificationChecked: {},
          outcome: null,
        });
        return;
      }

      const nextProperty = PROPERTIES.find((p) => p.id === search.propertyId) ?? null;
      if (!nextProperty || !nextCustomer.propertyIds.includes(nextProperty.id)) {
        setCustomer(nextCustomer);
        setProperty(null);
        setIssue(null);
        setChecked({});
        setVerificationChecked({});
        setOutcome(null);
        setPhase("customer");
        broadcastPatch({
          customerId: nextCustomer.id,
          propertyId: null,
          issueId: null,
          phase: "customer",
          checked: {},
          verificationChecked: {},
          outcome: null,
        });
        return;
      }

      if (!search.issueId) {
        setCustomer(nextCustomer);
        setProperty(nextProperty);
        setIssue(null);
        setChecked({});
        setVerificationChecked({});
        setOutcome(null);
        setPhase("property");
        broadcastPatch({
          customerId: nextCustomer.id,
          propertyId: nextProperty.id,
          issueId: null,
          phase: "property",
          checked: {},
          verificationChecked: {},
          outcome: null,
        });
        return;
      }

      const nextIssue = await getIssueById(search.issueId);
      if (!nextIssue) {
        setCustomer(nextCustomer);
        setProperty(nextProperty);
        setIssue(null);
        setChecked({});
        setVerificationChecked({});
        setOutcome(null);
        setPhase("property");
        broadcastPatch({
          customerId: nextCustomer.id,
          propertyId: nextProperty.id,
          issueId: null,
          phase: "property",
          checked: {},
          verificationChecked: {},
          outcome: null,
        });
        return;
      }

      setCustomer(nextCustomer);
      setProperty(nextProperty);
      setIssue(nextIssue);
      setChecked({});
      setVerificationChecked({});
      setOutcome(null);
      setPhase("protocol");
      setFormState((current) => {
        const synced = syncFormFromIssue(current, nextIssue);
        broadcastFull({
          customerId: nextCustomer.id,
          propertyId: nextProperty.id,
          issueId: nextIssue.id,
          phase: "protocol",
          form: synced,
          checked: {},
          verificationChecked: {},
          outcome: null,
        });
        return synced;
      });
    },
    [broadcastFull, broadcastPatch, resetWorkspaceSelection],
  );

  const clearForm = useCallback(() => {
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    const nextForm = baselineForm(issue);
    setFormState(nextForm);
    broadcastPatch({
      form: nextForm,
      checked: {},
      verificationChecked: {},
      outcome: null,
    });
  }, [broadcastPatch, issue]);

  const openCompose = useCallback(
    (mode: Exclude<ComposeMode, "closed"> = "expanded") => {
      setComposeMode(mode);
      broadcastPatch({ composeMode: mode, detached: mode === "detached" });
    },
    [broadcastPatch],
  );

  const closeCompose = useCallback(() => {
    if (composeMode === "detached" && !isPopupWindow) {
      closeDetachedWindow();
    }
    setComposeMode("closed");
    broadcastPatch({ composeMode: "closed", detached: false });
    if (isPopupWindow) {
      window.close();
    }
  }, [broadcastPatch, closeDetachedWindow, composeMode, isPopupWindow]);

  const minimizeCompose = useCallback(() => {
    setComposeMode("minimized");
    broadcastPatch({ composeMode: "minimized", detached: false });
  }, [broadcastPatch]);

  const expandCompose = useCallback(() => {
    setComposeMode("expanded");
    broadcastPatch({ composeMode: "expanded", detached: false });
  }, [broadcastPatch]);

  useEffect(() => {
    if (!issue) return;
    setFormState((current) => syncFormFromIssue(current, issue));
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
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

  const applyPatchRef = useRef(applyPatch);
  const applySnapshotRef = useRef(applySnapshot);
  const buildSnapshotRef = useRef(buildSnapshot);
  const closePopupWindowRef = useRef(closePopupWindow);

  useEffect(() => {
    applyPatchRef.current = applyPatch;
  }, [applyPatch]);

  useEffect(() => {
    applySnapshotRef.current = applySnapshot;
  }, [applySnapshot]);

  useEffect(() => {
    buildSnapshotRef.current = buildSnapshot;
  }, [buildSnapshot]);

  useEffect(() => {
    closePopupWindowRef.current = closePopupWindow;
  }, [closePopupWindow]);

  useEffect(() => {
    const sync = syncRef.current;
    const unsubscribe = sync.subscribe((message) => {
      if (message.type === "SYNC_FULL") {
        void applySnapshotRef.current(message.snapshot);
        return;
      }
      if (message.type === "SYNC_PATCH") {
        void applyPatchRef.current(message.patch);
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
          setComposeMode("detached");
        }
        return;
      }
      if (message.type === "ATTACH") {
        if (isPopupWindow) {
          window.close();
          return;
        }
        setComposeMode("expanded");
        closePopupWindowRef.current();
        return;
      }
      if (message.type === "SUBMIT_SUCCESS") {
        if (isPopupWindow) {
          window.close();
          return;
        }
        closePopupWindowRef.current();
        setPhase("browse");
        setCustomer(null);
        setProperty(null);
        setIssue(null);
        setChecked({});
        setVerificationChecked({});
        setOutcome(null);
        setFormState(emptyForm());
        setComposeMode("closed");
      }
    });

    if (isPopupWindow) {
      sync.post({ type: "REQUEST_FULL" });
    }

    return () => {
      unsubscribe();
    };
  }, [isPopupWindow]);

  useEffect(() => {
    return () => {
      syncRef.current.close();
    };
  }, []);

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
    });
  }, [createIncident, form, customer, property, issue]);

  const toggleStep = useCallback(
    (id: string) => {
      setChecked((current) => {
        const next = { ...current, [id]: !current[id] };
        broadcastPatch({ checked: next });
        return next;
      });
    },
    [broadcastPatch],
  );

  const toggleVerification = useCallback(
    (id: string) => {
      setVerificationChecked((current) => {
        const next = { ...current, [id]: !current[id] };
        broadcastPatch({ verificationChecked: next });
        return next;
      });
    },
    [broadcastPatch],
  );

  const setOutcomeWithSync = useCallback(
    (next: "resolve" | "escalate") => {
      setOutcome(next);
      broadcastPatch({ outcome: next });
    },
    [broadcastPatch],
  );

  const formDirty = isFormDirty(form, issue);
  const isDetached = composeMode === "detached";

  const value = useMemo(
    (): WorkspaceContextValue => ({
      phase,
      customer,
      property,
      issue,
      checked,
      verificationChecked,
      outcome,
      form,
      composeMode,
      isDetached,
      isPopupWindow,
      pipWindow,
      isFormDirty: formDirty,
      setForm,
      setOutcome: setOutcomeWithSync,
      setComposeMode,
      openCompose,
      closeCompose,
      minimizeCompose,
      detachCompose,
      attachCompose,
      expandCompose,
      selectCustomer,
      selectProperty,
      selectIssue,
      changeCustomer,
      changeProperty,
      changeIssue,
      hydrateFromSearch,
      clearAll,
      clearForm,
      submitIncident,
      toggleStep,
      toggleVerification,
      isSubmitting: createIncident.isPending,
    }),
    [
      phase,
      customer,
      property,
      issue,
      checked,
      verificationChecked,
      outcome,
      form,
      composeMode,
      isDetached,
      isPopupWindow,
      pipWindow,
      formDirty,
      setForm,
      setOutcomeWithSync,
      openCompose,
      closeCompose,
      minimizeCompose,
      detachCompose,
      attachCompose,
      expandCompose,
      selectCustomer,
      selectProperty,
      selectIssue,
      changeCustomer,
      changeProperty,
      changeIssue,
      hydrateFromSearch,
      clearAll,
      clearForm,
      submitIncident,
      toggleStep,
      toggleVerification,
      createIncident.isPending,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider.");
  }
  return ctx;
}

export type WorkspaceState = ReturnType<typeof useWorkspaceContext>;
