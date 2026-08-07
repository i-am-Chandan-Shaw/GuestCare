import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input, Select, Textarea, useCopyEndAction } from "@/shared/components/FloatingLabelField";
import { useIssues } from "@/features/copilot/hooks/useProtocolData";
import {
  mapLegacyIncidentStatus,
  mapReportStatusToLegacyIncidentStatus,
} from "@/features/reports/lib/report-status";
import { getPriorityMeta, priorityMeta } from "@/shared/constants/agent";
import { INCIDENT_STATUSES, INCIDENT_TYPES } from "@/shared/constants/incident";
import type { IncidentStatus, IncidentType, Priority } from "@/shared/types";
import type { Report, UpdateReportInput } from "@/shared/types/report";

type ReportFormState = Pick<
  Report,
  | "callerName"
  | "callerContact"
  | "reservationNumber"
  | "nameOnBooking"
  | "issueName"
  | "issueType"
  | "priority"
  | "status"
  | "callNotes"
  | "actionsTaken"
  | "version"
>;

function toFormState(report: Report): ReportFormState {
  return {
    callerName: report.callerName,
    callerContact: report.callerContact,
    reservationNumber: report.reservationNumber,
    nameOnBooking: report.nameOnBooking,
    issueName: report.issueName,
    issueType: report.issueType,
    priority: report.priority,
    status: report.status,
    callNotes: report.callNotes,
    actionsTaken: report.actionsTaken,
    version: report.version,
  };
}

export function ReportEditDialog({
  open,
  onOpenChange,
  report,
  pending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report;
  pending?: boolean;
  onSave: (input: UpdateReportInput) => void;
}) {
  const [form, setForm] = useState<ReportFormState>(() => toFormState(report));
  const { data: issues = [] } = useIssues(report.propertyId);
  const pMeta = getPriorityMeta(form.priority);
  const propertyLabel = report.propertyName || "";
  const propertyCopy = useCopyEndAction(propertyLabel, "property");
  const reservationCopy = useCopyEndAction(form.reservationNumber, "reservation");

  const issueOptions = (() => {
    const names = issues.map((i) => i.name);
    if (form.issueName && !names.includes(form.issueName)) {
      return [form.issueName, ...names];
    }
    return names.length ? names : form.issueName ? [form.issueName] : ["Other"];
  })();

  useEffect(() => {
    if (open) setForm(toFormState(report));
  }, [open, report]);

  const update = <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => onSave(form);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(92vh,820px)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl"
        onOpenAutoFocus={(event) => {
          // Skip read-only customer/property fields; focus the first editable input.
          event.preventDefault();
          const root = event.currentTarget;
          const editable = root.querySelector<HTMLElement>(
            'input:not([readonly]):not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([readonly]):not([disabled])',
          );
          editable?.focus();
        }}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border-color px-6 py-5 text-left">
          <DialogTitle className="text-[18px] font-bold tracking-tight text-text-primary">
            Edit report
          </DialogTitle>
          <DialogDescription className="text-[13px] text-text-secondary">
            Update report details, caller info, and call notes.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Customer" value={report.customerName} readOnly />

            <Input
              label="Property"
              value={propertyLabel}
              readOnly
              endAction={propertyLabel ? propertyCopy : undefined}
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
              value={form.reservationNumber}
              onChange={(v) => update("reservationNumber", v)}
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
              value={form.issueType}
              onChange={(v) => update("issueType", v as IncidentType)}
              options={INCIDENT_TYPES}
            />

            <Select
              label="What is the issue?"
              value={form.issueName}
              onChange={(v) => update("issueName", v)}
              options={issueOptions}
            />

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
              value={mapReportStatusToLegacyIncidentStatus(form.status)}
              onChange={(v) => update("status", mapLegacyIncidentStatus(v as IncidentStatus))}
              options={INCIDENT_STATUSES}
            />

            <div className="relative sm:col-span-2">
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
        </div>

        <DialogFooter className="shrink-0 gap-3 border-t border-border-color px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="button" size="lg" onClick={handleSave} loading={pending}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
