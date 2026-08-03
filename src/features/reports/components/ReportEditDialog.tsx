import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Select, Textarea } from "@/shared/components/form-controls";
import { REPORT_STATUS_LABELS } from "@/features/reports/lib/report-status";
import { priorityMeta } from "@/shared/constants/agent";
import { INCIDENT_TYPES } from "@/shared/constants/incident";
import type { Priority } from "@/shared/types";
import type { Report, ReportStatus, UpdateReportInput } from "@/shared/types/report";

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

  useEffect(() => {
    if (open) setForm(toFormState(report));
  }, [open, report]);

  const update = <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => onSave(form);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,820px)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border-color px-6 py-5 text-left">
          <DialogTitle className="text-[18px] font-bold tracking-tight text-text-primary">
            Edit report
          </DialogTitle>
          <DialogDescription className="text-[13px] text-text-secondary">
            Update report details, caller info, and call notes.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <section className="space-y-3">
            <h3 className="text-[13px] font-bold text-text-primary">Issue information</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Issue summary"
                  value={form.issueName}
                  onChange={(v) => update("issueName", v)}
                />
              </div>
              <Select
                label="Issue type"
                value={form.issueType}
                onChange={(v) => update("issueType", v)}
                options={INCIDENT_TYPES}
              />
              <Select
                label="Priority"
                value={form.priority}
                onChange={(v) => update("priority", v as Priority)}
                options={Object.keys(priorityMeta) as Priority[]}
                optionLabels={Object.fromEntries(
                  (Object.keys(priorityMeta) as Priority[]).map((key) => [
                    key,
                    priorityMeta[key].name,
                  ]),
                )}
              />
              <div className="sm:col-span-2">
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(v) => update("status", v as ReportStatus)}
                  options={Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]}
                  optionLabels={REPORT_STATUS_LABELS}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-border-color pt-5">
            <h3 className="text-[13px] font-bold text-text-primary">Call notes</h3>
            <Textarea
              label="Call notes"
              value={form.callNotes}
              onChange={(v) => update("callNotes", v)}
              rows={4}
            />
          </section>

          <section className="space-y-3 border-t border-border-color pt-5">
            <h3 className="text-[13px] font-bold text-text-primary">Caller & booking</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Caller name"
                value={form.callerName}
                onChange={(v) => update("callerName", v)}
              />
              <Input
                label="Caller contact"
                value={form.callerContact}
                onChange={(v) => update("callerContact", v)}
              />
              <Input
                label="Reservation"
                value={form.reservationNumber}
                onChange={(v) => update("reservationNumber", v)}
              />
              <Input
                label="Name on booking"
                value={form.nameOnBooking}
                onChange={(v) => update("nameOnBooking", v)}
              />
            </div>
          </section>
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
