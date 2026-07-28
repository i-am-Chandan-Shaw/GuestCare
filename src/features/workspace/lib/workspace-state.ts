import type { FormState } from "@/features/copilot/components";
import type { Customer, Issue, Property } from "@/shared/types";
import { protocolToIncidentType } from "@/shared/types";

export type WorkspacePhase = "browse" | "customer" | "property" | "protocol";

export function syncFormFromIssue(form: FormState, issue: Issue): FormState {
  return {
    ...form,
    issueSummary: issue.name,
    incidentType: protocolToIncidentType(issue.category),
    priority: issue.priority,
  };
}

export function syncNotesFromSteps(
  form: FormState,
  issue: Issue,
  checked: Record<string, boolean>,
): FormState {
  const doneLabels = issue.steps
    .filter((s) => checked[s.id])
    .map((s) => `• ${s.label}`)
    .join("\n");
  if (!doneLabels) return form;
  return {
    ...form,
    callNotes: form.callNotes.includes(doneLabels)
      ? form.callNotes
      : [form.callNotes, doneLabels].filter(Boolean).join("\n"),
  };
}

export function createEmptyWorkspaceSelection(): {
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  phase: WorkspacePhase;
} {
  return {
    customer: null,
    property: null,
    issue: null,
    phase: "browse",
  };
}
