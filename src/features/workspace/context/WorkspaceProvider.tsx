import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { emptyForm, type FormState } from "@/features/copilot/components";
import { getIssueById } from "@/features/copilot/api/protocols.api";
import { useCreateIncidentMutation } from "@/features/incidents/hooks/useIncidents";
import {
  syncFormFromIssue,
  syncNotesFromSteps,
  type WorkspacePhase,
} from "@/features/workspace/lib/workspace-state";
import type { WorkspaceSearch } from "@/features/workspace/lib/workspace-url";
import { CUSTOMERS } from "@/data/mock";
import { PROPERTIES } from "@/data/properties";
import type { Customer, Issue, Property } from "@/shared/types";
import { protocolToIncidentType } from "@/shared/types";

export type ComposeMode = "closed" | "expanded" | "minimized" | "pip";

export type { WorkspacePhase };

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
  isFormDirty: boolean;
  setForm: (f: FormState) => void;
  setOutcome: (o: "resolve" | "escalate") => void;
  setComposeMode: (mode: ComposeMode) => void;
  openCompose: (mode?: Exclude<ComposeMode, "closed">) => void;
  closeCompose: () => void;
  minimizeCompose: () => void;
  pipCompose: () => void;
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
  const [phase, setPhase] = useState<WorkspacePhase>("browse");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [verificationChecked, setVerificationChecked] = useState<Record<string, boolean>>({});
  const [outcome, setOutcome] = useState<"resolve" | "escalate" | null>(null);
  const [composeMode, setComposeMode] = useState<ComposeMode>("closed");
  const [form, setForm] = useState<FormState>(emptyForm);

  const clearAll = useCallback(() => {
    setPhase("browse");
    setCustomer(null);
    setProperty(null);
    setIssue(null);
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    setForm(emptyForm());
    setComposeMode("closed");
  }, []);

  const createIncident = useCreateIncidentMutation({ onSuccess: clearAll });

  const selectCustomer = useCallback((next: Customer) => {
    setCustomer(next);
    setProperty(null);
    setIssue(null);
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    setPhase("customer");
  }, []);

  const selectProperty = useCallback((next: Property) => {
    setProperty(next);
    setIssue(null);
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    setPhase("property");
  }, []);

  const selectIssue = useCallback((next: Issue) => {
    setIssue(next);
    setForm((current) => syncFormFromIssue(current, next));
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    setPhase("protocol");
  }, []);

  const changeCustomer = useCallback(() => {
    setCustomer(null);
    setProperty(null);
    setIssue(null);
    setPhase("browse");
  }, []);

  const changeProperty = useCallback(() => {
    setProperty(null);
    setIssue(null);
    setPhase("customer");
  }, []);

  const changeIssue = useCallback(() => {
    setIssue(null);
    setPhase("property");
  }, []);

  const hydrateFromSearch = useCallback(async (search: WorkspaceSearch) => {
    if (!search.customerId) {
      clearAll();
      return;
    }

    const nextCustomer = CUSTOMERS.find((c) => c.id === search.customerId) ?? null;
    if (!nextCustomer) {
      clearAll();
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
      return;
    }

    setCustomer(nextCustomer);
    setProperty(nextProperty);
    setIssue(nextIssue);
    setForm((current) => syncFormFromIssue(current, nextIssue));
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    setPhase("protocol");
  }, [clearAll]);

  const clearForm = useCallback(() => {
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    setForm(baselineForm(issue));
  }, [issue]);

  const openCompose = useCallback((mode: Exclude<ComposeMode, "closed"> = "expanded") => {
    setComposeMode(mode);
  }, []);

  const closeCompose = useCallback(() => {
    setComposeMode("closed");
  }, []);

  const minimizeCompose = useCallback(() => {
    setComposeMode("minimized");
  }, []);

  const pipCompose = useCallback(() => {
    setComposeMode((current) => (current === "pip" ? "expanded" : "pip"));
  }, []);

  const expandCompose = useCallback(() => {
    setComposeMode("expanded");
  }, []);

  useEffect(() => {
    if (!issue) return;
    setForm((current) => syncFormFromIssue(current, issue));
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
  }, [issue]);

  useEffect(() => {
    if (!issue) return;
    setForm((current) => syncNotesFromSteps(current, issue, checked));
  }, [checked, issue]);

  useEffect(() => {
    if (!outcome) return;
    setForm((current) => ({
      ...current,
      status: outcome === "resolve" ? "Resolved" : "Unresolved - Escalation Handover",
    }));
  }, [outcome]);

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

  const toggleStep = useCallback((id: string) => {
    setChecked((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const toggleVerification = useCallback((id: string) => {
    setVerificationChecked((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  const formDirty = isFormDirty(form, issue);

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
      isFormDirty: formDirty,
      setForm,
      setOutcome,
      setComposeMode,
      openCompose,
      closeCompose,
      minimizeCompose,
      pipCompose,
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
      formDirty,
      openCompose,
      closeCompose,
      minimizeCompose,
      pipCompose,
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
