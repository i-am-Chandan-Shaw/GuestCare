import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, FilePlus2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { getPriorityMeta, priorityMeta } from "@/shared/constants/agent";
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
import { Input, Select, Textarea, useCopyEndAction } from "@/shared/components/FloatingLabelField";

type SubmitMode = "log" | "logAndSlack";

const SUBMIT_MODES: {
  id: SubmitMode;
  label: string;
  Icon: typeof FilePlus2;
}[] = [
  { id: "log", label: "Log Report", Icon: FilePlus2 },
  { id: "logAndSlack", label: "Report & Send to Slack", Icon: Send },
];

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
  onSubmit: (options?: { sendToSlack?: boolean }) => void;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  embedded?: boolean;
  compact?: boolean;
  isSubmitting?: boolean;
}) {
  const { data: issues = [] } = useIssues(property?.id);
  const [confirmClear, setConfirmClear] = useState(false);
  const [submitMode, setSubmitMode] = useState<SubmitMode>("log");
  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm({ ...form, [k]: v });
  const pMeta = getPriorityMeta(form.priority);
  const propertyLabel = property ? `${property.name} — ${property.address}` : "—";
  const issueOptions = issues.map((i) => i.name);
  const propertyCopy = useCopyEndAction(property ? propertyLabel : "", "property");
  const reservationCopy = useCopyEndAction(form.reservation, "reservation");

  const requestClear = () => setConfirmClear(true);
  const confirmClearForm = () => {
    setConfirmClear(false);
    onClear();
  };

  const scrollPadding = embedded ? (compact ? "space-y-3 p-3" : "space-y-4 p-4") : "space-y-4 p-6";
  const customerContactLine = customer
    ? [customer.email, customer.phone].filter(Boolean).join(" · ")
    : "";

  const formFields = (
    <div className="space-y-4">
      <div>
        <Input label="Customer" value={customer?.name ?? ""} readOnly />
        {customerContactLine ? (
          <p className="mt-1.5 text-[11.5px] text-text-muted">{customerContactLine}</p>
        ) : null}
      </div>

      <Input
        label="Property"
        value={property ? propertyLabel : ""}
        readOnly
        endAction={propertyCopy}
      />

      <Input
        label="Guest full name"
        value={form.callerName}
        onChange={(v) => update("callerName", v)}
      />

      <Input
        label="Guest contact"
        value={form.callerContact}
        onChange={(v) => update("callerContact", v)}
      />

      <Input
        label="Reservation number"
        value={form.reservation}
        onChange={(v) => update("reservation", v)}
        mono
        endAction={reservationCopy}
      />

      <Input
        label="Name on the booking"
        value={form.nameOnBooking}
        onChange={(v) => update("nameOnBooking", v)}
      />

      <Select
        label="Issue type"
        value={form.incidentType}
        onChange={(v) => update("incidentType", v as IncidentType)}
        options={INCIDENT_TYPES}
      />

      <Select
        label="What is the issue?"
        value={form.issueSummary || (issue?.name ?? "")}
        onChange={(v) => update("issueSummary", v)}
        options={issueOptions.length ? issueOptions : ["Other"]}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Select
            label="Priority"
            className="[&_select]:pl-8"
            value={form.priority}
            onChange={(v) => update("priority", v as Priority)}
            options={["High", "Medium-High", "Medium", "Low"]}
            optionLabels={{
              High: priorityMeta.High.name,
              "Medium-High": priorityMeta["Medium-High"].name,
              Medium: priorityMeta.Medium.name,
              Low: priorityMeta.Low.name,
            }}
          />
          <span
            className={cn(
              "pointer-events-none absolute left-3 top-[30px] h-2 w-2 rounded-full",
              pMeta.dot,
            )}
          />
        </div>
        <Select
          label="Issue status"
          value={form.status}
          onChange={(v) => update("status", v as IncidentStatus)}
          options={INCIDENT_STATUSES}
        />
      </div>

      <ProtocolProgressCard issue={issue} />

      <div className="relative">
        <Textarea
          label="Call notes"
          value={form.callNotes}
          onChange={(v) => update("callNotes", v.slice(0, 2000))}
          rows={5}
        />
        <div className="pointer-events-none absolute bottom-2.5 right-3 text-[11px] font-medium text-text-muted">
          {form.callNotes.length} / 2000
        </div>
      </div>
    </div>
  );

  const activeMode = SUBMIT_MODES.find((mode) => mode.id === submitMode) ?? SUBMIT_MODES[0];
  const ActiveIcon = activeMode.Icon;

  const submitButton = (
    <div
      className={cn(
        "inline-flex h-12 overflow-hidden rounded-[16px] border border-solid border-[#e7e7e5] bg-brand-primary text-white",
        "font-[family-name:var(--font-display)] text-[15px] font-semibold",
        "transition-[opacity] duration-300 ease-out",
        isSubmitting && "opacity-50",
        embedded ? "min-w-0 flex-1" : "w-full",
      )}
    >
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() =>
          onSubmit(submitMode === "logAndSlack" ? { sendToSlack: true } : undefined)
        }
        className={cn(
          "relative inline-flex min-w-0 flex-1 items-center justify-center gap-2 px-4",
          "cursor-pointer enabled:hover:opacity-90 active:scale-[0.99]",
          "disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset",
        )}
      >
        {isSubmitting ? (
          <Loader2 className="absolute h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        <span
          className={cn(
            "inline-flex items-center justify-center gap-2 truncate",
            isSubmitting && "invisible",
          )}
        >
          {embedded ? null : <ActiveIcon className="h-4 w-4 shrink-0" strokeWidth={2} />}
          <span className="truncate">{activeMode.label}</span>
        </span>
      </button>

      <div className="w-px shrink-0 self-stretch bg-white/25" aria-hidden />

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            disabled={isSubmitting}
            aria-label="Choose report submit action"
            className={cn(
              "inline-flex w-11 shrink-0 items-center justify-center",
              "cursor-pointer enabled:hover:opacity-90 active:scale-[0.99]",
              "disabled:cursor-not-allowed",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset",
            )}
          >
            <ChevronDown className="h-4 w-4 opacity-90" strokeWidth={2} />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            side="top"
            align="end"
            sideOffset={6}
            className={cn(
              // Above IncidentComposeWindow (z-9999) and the closed FAB (z-10000)
              "z-[10050] min-w-[240px] rounded-lg bg-card-bg p-1",
              "[filter:drop-shadow(0_8px_20px_rgba(42,38,34,0.14))_drop-shadow(0_0_0.6px_var(--kn-color-border))]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            )}
          >
            {SUBMIT_MODES.map(({ id, label, Icon }) => (
              <DropdownMenu.Item
                key={id}
                onSelect={() => setSubmitMode(id)}
                className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-text-primary outline-none data-[highlighted]:bg-app-bg"
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="flex-1">{label}</span>
                {submitMode === id ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-brand-primary" strokeWidth={2.5} />
                ) : null}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );

  if (embedded) {
    return (
      <div className="relative flex h-full flex-col bg-surface">
        {isSubmitting && <div className="absolute inset-0 z-10 cursor-wait" aria-hidden />}
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
      {isSubmitting && <div className="absolute inset-0 z-10 cursor-wait" aria-hidden />}
      {confirmClear ? (
        <ClearFormConfirmBanner
          onCancel={() => setConfirmClear(false)}
          onConfirm={confirmClearForm}
        />
      ) : null}
      <div className={cn("flex-1 overflow-y-auto scrollbar-thin", scrollPadding)}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-foreground">Report Details</h2>
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
