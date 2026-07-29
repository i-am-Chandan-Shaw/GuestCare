import { emptyForm, type FormState } from "@/features/incidents/components/incident-form.types";
import type { Issue } from "@/shared/types";
import { protocolToIncidentType } from "@/shared/types";

export function getIncidentFormBaseline(issue: Issue | null): FormState {
  return {
    ...emptyForm(),
    issueSummary: issue?.name ?? "",
    incidentType: issue ? protocolToIncidentType(issue.category) : "Other",
    priority: issue?.priority ?? "P2",
  };
}

export function isIncidentFormDirty(form: FormState, issue: Issue | null): boolean {
  return JSON.stringify(form) !== JSON.stringify(getIncidentFormBaseline(issue));
}
