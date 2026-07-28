import { Drawer } from "./ui";
import type { Customer, IncidentStatus, IncidentType, Issue, Priority, Property } from "@/data/mock";
import { AGENT, INCIDENT_TYPES, INCIDENT_STATUSES, ISSUES, priorityMeta } from "@/data/mock";
import { Hash, MessageSquare, Copy, X, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export interface FormState {
  callerName: string;
  callerContact: string;
  reservation: string;
  nameOnBooking: string;
  incidentType: IncidentType;
  issueSummary: string;
  actions: string[];
  priority: Priority;
  status: IncidentStatus;
  callNotes: string;
}

const ACTION_CHIPS = [
  "Checked breaker",
  "Reset boiler",
  "Generated KeyNest code",
  "Called host",
  "Shared WiFi details",
  "Advised wait until morning",
];

export function emptyForm(): FormState {
  return {
    callerName: "",
    callerContact: "",
    reservation: "",
    nameOnBooking: "",
    incidentType: "Technical Issues",
    issueSummary: "",
    actions: [],
    priority: "P2",
    status: "In Progress",
    callNotes: "",
  };
}

function CopyIconButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(value && value !== "—");

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!canCopy}
      aria-label={`Copy ${label}`}
      className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
        canCopy ? "text-muted-foreground hover:text-foreground cursor-pointer" : "text-muted-foreground/40 cursor-not-allowed",
      )}
    >
      {copied ? (
        <span className="text-[10px] text-success font-semibold">Copied!</span>
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

export function IncidentDrawer({
  open,
  onClose,
  form,
  setForm,
  onClear,
  customer,
  property,
  issue,
}: {
  open: boolean;
  onClose: () => void;
  form: FormState;
  setForm: (f: FormState) => void;
  onClear: () => void;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
}) {
  return (
    <Drawer open={open} onClose={onClose} title="Incident Details" subtitle="" badge={undefined}>
      <IncidentContent
        form={form}
        setForm={setForm}
        onClear={onClear}
        customer={customer}
        property={property}
        issue={issue}
      />
    </Drawer>
  );
}

function IncidentContent({
  form,
  setForm,
  onClear,
  customer,
  property,
  issue,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onClear: () => void;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
}) {
  const [submitted, setSubmitted] = useState(false);
  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm({ ...form, [k]: v });
  const timestamp = useMemo(
    () =>
      new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [],
  );
  const pMeta = priorityMeta[form.priority];
  const propertyLabel = property ? `${property.name} — ${property.address}` : "—";
  const issueOptions = ISSUES.map((i) => i.name);

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

  const clearForm = () => {
    onClear();
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex-1 space-y-4 p-6 overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-foreground">Incident Details</h2>
          <button
            type="button"
            onClick={clearForm}
            className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-semibold text-foreground hover:bg-surface-2 transition-colors"
          >
            Clear Form
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Customer">
            <Input
              value={customer?.name ?? ""}
              readOnly
              placeholder="Select customer in top bar"
            />
            {customer && (
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
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
                <span className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full", pMeta.dot)} />
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
                      active ? "bg-primary/10 text-primary" : "bg-surface-2 text-muted-foreground hover:text-foreground",
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
              <div className="absolute bottom-2 right-3 text-[11px] font-medium text-muted-foreground">
                {form.callNotes.length} / 2000
              </div>
            </div>
          </Field>
        </div>

        <div className="mt-6 rounded-xl border border-border/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-surface-2/50 px-4 py-3">
            <div className="flex items-center gap-2.5 font-semibold text-[14px] text-foreground">
              <div className="flex items-center justify-center h-6 w-6 rounded bg-primary/10 text-primary">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              Slack Preview
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-success/10 border border-success/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_0_2px_rgba(34,197,94,0.2)]" /> Live
            </span>
          </div>

          <div className="bg-surface p-4">
            <div className="flex items-start gap-3">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Agent" className="mt-1 h-8 w-8 rounded-md object-cover" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[13.5px] text-foreground mb-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  guest-issues
                </div>
                <div className="text-[13px] leading-relaxed text-foreground space-y-0.5">
                  <div>
                    <span className="font-semibold">Customer:</span> {customer?.name || "—"}
                  </div>
                  <div>
                    <span className="font-semibold">Guest:</span> {form.callerName || "—"} ({form.callerContact || "—"})
                  </div>
                  <div>
                    <span className="font-semibold">Booking name:</span> {form.nameOnBooking || "—"}
                  </div>
                  <div>
                    <span className="font-semibold">Reservation:</span> {form.reservation || "N/A"}
                  </div>
                  <div>
                    <span className="font-semibold">Property:</span> {property?.name ?? "—"}
                  </div>
                  <div>
                    <span className="font-semibold">Type:</span> {form.incidentType}
                  </div>
                  <div>
                    <span className="font-semibold">Issue:</span> {form.issueSummary || issue?.name || "—"}{" "}
                    <span className="text-warning font-medium">({form.priority})</span>
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> {form.status}
                  </div>
                  {form.actions.length > 0 && (
                    <div>
                      <span className="font-semibold">Actions:</span> {form.actions.join(", ")}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Notes:</span> {form.callNotes || "—"}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted-foreground font-medium">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Priya" className="h-4 w-4 rounded-full" />
                  {timestamp} · {AGENT.name} ({AGENT.handle})
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex">
          <button
            type="button"
            onClick={() => {
              setSubmitted(true);
              setTimeout(() => setSubmitted(false), 2500);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-l-xl bg-primary py-3.5 text-[14px] font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-[0.99]"
          >
            <FileText className="h-4 w-4" /> {submitted ? "Logged!" : "Log Incident Report"}
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-r-xl border-l border-white/20 bg-primary px-4 py-3.5 text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="mb-2 block text-[13.5px] font-semibold text-foreground">{label}</span>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  mono,
  readOnly,
  className,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-surface px-3 text-[13.5px] text-foreground outline-none transition-all placeholder:text-muted-foreground shadow-sm",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        readOnly && "bg-surface-2/60 text-muted-foreground cursor-default focus:ring-0 focus:border-border",
        mono && "font-mono",
        className,
      )}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-[13.5px] text-foreground outline-none transition-all placeholder:text-muted-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-surface px-3 text-[13.5px] font-medium text-foreground outline-none transition-all shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%23666%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] cursor-pointer",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o} value={o.startsWith("P") && o.includes("·") ? o.split(" ")[0] : o}>
          {o}
        </option>
      ))}
    </select>
  );
}
