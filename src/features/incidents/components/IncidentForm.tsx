import { FilePlus2 } from "lucide-react";
import { useState } from "react";
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
import { ProtocolProgressCard } from "./ProtocolProgressCard";
import type { FormState } from "./incident-form.types";
import { CopyIconButton, Field, Input, Select, Textarea } from "./incident-form-controls";

function ClearFormConfirmBanner({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-warning/10 px-3 py-2 text-[12px]">
      <span className="text-foreground">Clear form? This will discard your draft.</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-border px-2 py-0.5 font-medium hover:bg-surface"
        >
          Keep editing
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded bg-destructive px-2 py-0.5 font-medium text-destructive-foreground"
        >
          Clear form
        </button>
      </div>
    </div>
  );
}

function ResetFormButton({
  onRequestClear,
  disabled,
}: {
  onRequestClear: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      onClick={onRequestClear}
      disabled={disabled}
      className="shrink-0 bg-white hover:bg-app-bg"
    >
      Clear Form
    </Button>
  );
}

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
  const [confirmClear, setConfirmClear] = useState(false);
  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm({ ...form, [k]: v });
  const pMeta = priorityMeta[form.priority];
  const propertyLabel = property ? `${property.name} — ${property.address}` : "—";
  const issueOptions = issues.map((i) => i.name);

  const requestClear = () => setConfirmClear(true);
  const confirmClearForm = () => {
    setConfirmClear(false);
    onClear();
  };

  const scrollPadding = embedded ? (compact ? "space-y-3 p-3" : "space-y-4 p-4") : "space-y-4 p-6";

  const formFields = (
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

      <ProtocolProgressCard issue={issue} />

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
  );

  const submitButton = (
    <Button
      type="button"
      size="lg"
      onClick={onSubmit}
      loading={isSubmitting}
      className={cn("active:scale-[0.99]", embedded ? "min-w-0 flex-1" : "w-full")}
    >
      {embedded ? "Log Incident" : (
        <>
          <FilePlus2 className="h-4 w-4" />
          Log Incident
        </>
      )}
    </Button>
  );

  if (embedded) {
    return (
      <div className="relative flex h-full flex-col bg-surface">
        {isSubmitting && (
          <div className="absolute inset-0 z-10 cursor-wait" aria-hidden />
        )}
        {confirmClear ? (
          <ClearFormConfirmBanner
            onCancel={() => setConfirmClear(false)}
            onConfirm={confirmClearForm}
          />
        ) : null}
        <div className={cn("min-h-0 flex-1 overflow-y-auto scrollbar-thin", scrollPadding)}>
          {formFields}
          <IncidentPreview form={form} customer={customer} property={property} issue={issue} />
        </div>

        <footer className="flex shrink-0 items-center gap-3 border-t border-border bg-surface px-4 py-3">
          <ResetFormButton onRequestClear={requestClear} disabled={isSubmitting} />
          {submitButton}
        </footer>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-surface">
      {isSubmitting && (
        <div className="absolute inset-0 z-10 cursor-wait" aria-hidden />
      )}
      {confirmClear ? (
        <ClearFormConfirmBanner
          onCancel={() => setConfirmClear(false)}
          onConfirm={confirmClearForm}
        />
      ) : null}
      <div className={cn("flex-1 overflow-y-auto scrollbar-thin", scrollPadding)}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-foreground">Incident Details</h2>
          <button
            type="button"
            onClick={requestClear}
            disabled={isSubmitting}
            className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Clear Form
          </button>
        </div>

        {formFields}
        <IncidentPreview form={form} customer={customer} property={property} issue={issue} />

        <div className="mt-6">{submitButton}</div>
      </div>
    </div>
  );
}
