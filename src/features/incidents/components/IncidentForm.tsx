import { FilePlus2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { priorityMeta } from "@/shared/constants/agent";
import { INCIDENT_STATUSES, INCIDENT_TYPES } from "@/shared/constants/incident";
import { useIssues } from "@/features/copilot/hooks/useProtocolData";
import type {
  Customer,
  IncidentStatus,
  IncidentType,
  Issue,
  Priority,
  Property,
} from "@/shared/types";
import { IncidentPreview } from "./IncidentPreview";
import { ACTION_CHIPS, type FormState } from "./incident-form.types";
import { CopyIconButton, Field, Input, Select, Textarea } from "./incident-form-controls";

export function IncidentForm({
  form,
  setForm,
  onClear,
  onSubmit,
  customer,
  property,
  issue,
  embedded = false,
  compact = false,
  isSubmitting = false,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onClear: () => void;
  onSubmit: () => void;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  embedded?: boolean;
  compact?: boolean;
  isSubmitting?: boolean;
}) {
  const { data: issues = [] } = useIssues();
  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm({ ...form, [k]: v });
  const pMeta = priorityMeta[form.priority];
  const propertyLabel = property ? `${property.name} — ${property.address}` : "—";
  const issueOptions = issues.map((i) => i.name);

  const toggleAction = (label: string) => {
    const has = form.actions.includes(label);
    const next = has ? form.actions.filter((a) => a !== label) : [...form.actions, label];
    const noteLine = `• ${label}`;
    let notes = form.callNotes;
    if (!has && !notes.includes(label)) {
      notes = notes ? `${notes}\n${noteLine}` : noteLine;
    }
    setForm({ ...form, actions: next, callNotes: notes });
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <div
        className={cn(
          "flex-1 overflow-y-auto scrollbar-thin",
          embedded ? (compact ? "space-y-3 p-3" : "space-y-4 p-4") : "space-y-4 p-6",
        )}
      >
        {!embedded && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-foreground">Incident Details</h2>
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-2"
            >
              Clear Form
            </button>
          </div>
        )}

        {embedded && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-2"
            >
              Clear Form
            </button>
          </div>
        )}

        <div className="space-y-4">
          <Field label="Customer">
            <Input value={customer?.name ?? ""} readOnly placeholder="Select customer in top bar" />
            {customer && (
              <p className="mt-1.5 text-[11.5px] text-text-muted">
                {customer.email} · {customer.phone}
              </p>
            )}
          </Field>

          <Field label="Property">
            <div className="relative">
              <Input
                value={property ? propertyLabel : ""}
                readOnly
                placeholder="Select property in top bar"
                className="pr-10"
              />
              <CopyIconButton value={propertyLabel} label="property" />
            </div>
          </Field>

          <Field label="Guest full name">
            <Input
              value={form.callerName}
              onChange={(v) => update("callerName", v)}
              placeholder="Name of guest on the call"
            />
          </Field>

          <Field label="Guest contact">
            <Input
              value={form.callerContact}
              onChange={(v) => update("callerContact", v)}
              placeholder="Phone or email from the call"
            />
          </Field>

          <Field label="Reservation number">
            <div className="relative">
              <Input
                value={form.reservation}
                onChange={(v) => update("reservation", v)}
                placeholder="RSV-… or N/A"
                mono
                className="pr-10"
              />
              <CopyIconButton value={form.reservation} label="reservation" />
            </div>
          </Field>

          <Field label="Name on the booking">
            <Input
              value={form.nameOnBooking}
              onChange={(v) => update("nameOnBooking", v)}
              placeholder="May differ from guest on the call"
            />
          </Field>

          <Field label="Incident Type">
            <Select
              value={form.incidentType}
              onChange={(v) => update("incidentType", v as IncidentType)}
              options={INCIDENT_TYPES}
            />
          </Field>

          <Field label="What is the Issue?">
            <Select
              value={form.issueSummary || (issue?.name ?? "")}
              onChange={(v) => update("issueSummary", v)}
              options={issueOptions.length ? issueOptions : ["Other"]}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <div className="relative">
                <Select
                  className="pl-8"
                  value={form.priority}
                  onChange={(v) => update("priority", v.split(" ")[0] as Priority)}
                  options={["P1 · Critical", "P2 · High", "P3 · Medium", "P4 · Low"]}
                />
                <span
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full",
                    pMeta.dot,
                  )}
                />
              </div>
            </Field>
            <Field label="Issue Status">
              <Select
                value={form.status}
                onChange={(v) => update("status", v as IncidentStatus)}
                options={INCIDENT_STATUSES}
              />
            </Field>
          </div>

          <Field label="Actions Taken">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 min-h-[46px] shadow-sm">
              {ACTION_CHIPS.map((label) => {
                const active = form.actions.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleAction(label)}
                    className={cn(
                      "cursor-pointer flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-2 text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {label}
                    {active && <X className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Call Notes">
            <div className="relative">
              <Textarea
                value={form.callNotes}
                onChange={(v) => update("callNotes", v.slice(0, 2000))}
                placeholder="What you tried, who you called, codes generated, next steps…"
                rows={5}
              />
              <div className="absolute bottom-2 right-3 text-[11px] font-medium text-text-muted">
                {form.callNotes.length} / 2000
              </div>
            </div>
          </Field>
        </div>

        <IncidentPreview form={form} customer={customer} property={property} issue={issue} />

        <div className="mt-6">
          <Button
            type="button"
            size="lg"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full active:scale-[0.99]"
          >
            <FilePlus2 className="h-4 w-4" />
            Log Incident
          </Button>
        </div>
      </div>
    </div>
  );
}
