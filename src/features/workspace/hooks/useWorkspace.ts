import { useCallback, useEffect, useMemo, useState } from "react";
import { emptyForm, type FormState } from "@/features/copilot/components";
import { useCreateIncidentMutation } from "@/features/incidents/hooks/useIncidents";
import {
  syncFormFromIssue,
  syncNotesFromSteps,
  type WorkspacePhase,
} from "@/features/workspace/lib/workspace-state";
import type { Customer, Issue, Property } from "@/shared/types";
import { protocolToIncidentType } from "@/shared/types";

export type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";

export function useWorkspace() {
  const [phase, setPhase] = useState<WorkspacePhase>("browse");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [verificationChecked, setVerificationChecked] = useState<Record<string, boolean>>({});
  const [outcome, setOutcome] = useState<"resolve" | "escalate" | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    setDrawerOpen(false);
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

  const clearForm = useCallback(() => {
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    setForm({
      ...emptyForm(),
      issueSummary: issue?.name ?? "",
      incidentType: issue ? protocolToIncidentType(issue.category) : "Other",
      priority: issue?.priority ?? "P2",
    });
  }, [issue]);

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

  return useMemo(
    () => ({
      phase,
      customer,
      property,
      issue,
      checked,
      verificationChecked,
      outcome,
      drawerOpen,
      form,
      setForm,
      setOutcome,
      setDrawerOpen,
      selectCustomer,
      selectProperty,
      selectIssue,
      changeCustomer,
      changeProperty,
      changeIssue,
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
      drawerOpen,
      form,
      selectCustomer,
      selectProperty,
      selectIssue,
      changeCustomer,
      changeProperty,
      changeIssue,
      clearAll,
      clearForm,
      submitIncident,
      toggleStep,
      toggleVerification,
      createIncident.isPending,
    ],
  );
}

export type WorkspaceState = ReturnType<typeof useWorkspace>;
