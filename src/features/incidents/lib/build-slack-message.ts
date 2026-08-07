import type { Customer, Issue, Property } from "@/shared/types";
import type { FormState } from "@/features/incidents/components/incident-form.types";

export function buildSlackIncidentMessage({
  form,
  customer,
  property,
  issue,
}: {
  form: FormState;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
}): string {
  const propertyLine = property
    ? [property.name, property.address].filter(Boolean).join(", ")
    : "—";
  const issueSummary = form.issueSummary.trim() || issue?.name?.trim() || "—";
  const notes = form.callNotes.trim() || "—";

  return [
    `Line Called: ${customer?.name || "—"}`,
    `Inbound for ${propertyLine}`,
    "",
    `Incident Type: ${form.incidentType || "—"}`,
    `What is the Issue?: ${issueSummary}`,
    `Status: ${form.status || "—"}`,
    `Priority: ${form.priority || "—"}`,
    "",
    `Caller Full Name: ${form.callerName || "—"}`,
    `Caller Contact: ${form.callerContact || "—"}`,
    `Reservation #: ${form.reservation || "N/A"}`,
    "",
    "Call Notes:",
    notes,
  ].join("\n");
}
