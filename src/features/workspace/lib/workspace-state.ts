import type { FormState } from "@/features/incidents/components/incident-form.types";
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
