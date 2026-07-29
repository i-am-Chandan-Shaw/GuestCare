import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ACTION_CHIPS } from "@/features/incidents/components/incident-form.types";
import { Field, Input, Select, Textarea } from "@/features/incidents/components/incident-form-controls";
import {
  useAddReportCommentMutation,
  useAssignReportMutation,
  useAssignmentAgentsQuery,
  useReportActor,
  useReportDetailQuery,
  useUpdateReportMutation,
} from "@/features/reports/hooks/useReports";
import type { Priority } from "@/shared/types";
import type { Report, ReportStatus } from "@/shared/types/report";
import { ReportStatusBadge, ReportThread } from "@/features/reports/components/ReportThread";
import { REPORT_STATUS_LABELS } from "@/features/reports/lib/report-status";
import { agentCanAssignReport, agentCanEditReport } from "@/features/reports/lib/report-scope";
import { formatActivityTimestamp } from "@/shared/lib/datetime";
import { priorityMeta } from "@/shared/constants/agent";
import { INCIDENT_TYPES } from "@/shared/constants/incident";

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
  | "assignedAgentId"
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
    assignedAgentId: report.assignedAgentId,
    version: report.version,
  };
}

export function ReportDetailPanel({ reportId }: { reportId: string }) {
  const actor = useReportActor();
  const { data, isLoading } = useReportDetailQuery(reportId);
  const { data: agents = [] } = useAssignmentAgentsQuery();
  const updateReport = useUpdateReportMutation(reportId);
  const assignReport = useAssignReportMutation(reportId);
  const addComment = useAddReportCommentMutation(reportId);

  const [form, setForm] = useState<ReportFormState | null>(null);
  const [comment, setComment] = useState("");
  const [assignNote, setAssignNote] = useState("");

  useEffect(() => {
    if (data?.report) {
      setForm(toFormState(data.report));
    } else {
      setForm(null);
    }
  }, [data?.report, reportId]);

  if (isLoading) {
    return <div className="p-6 text-[13px] text-text-secondary">Loading report…</div>;
  }

  if (!data?.report) {
    return (
      <div className="p-6 text-[13px] text-text-secondary">
        Report not found or you don&apos;t have access.
      </div>
    );
  }

  if (!form) {
    return <div className="p-6 text-[13px] text-text-secondary">Loading report…</div>;
  }

  const { report, thread } = data;
  const canEdit = agentCanEditReport(actor, report);
  const canAssign = agentCanAssignReport(actor, report);

  const update = <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const toggleAction = (label: string) => {
    const has = form.actionsTaken.includes(label);
    update(
      "actionsTaken",
      has ? form.actionsTaken.filter((a) => a !== label) : [...form.actionsTaken, label],
    );
  };

  const isBusy =
    updateReport.isPending || assignReport.isPending || addComment.isPending;

  const handleSave = () => {
    updateReport.mutate({
      callerName: form.callerName,
      callerContact: form.callerContact,
      reservationNumber: form.reservationNumber,
      nameOnBooking: form.nameOnBooking,
      issueName: form.issueName,
      issueType: form.issueType,
      priority: form.priority,
      status: form.status,
      callNotes: form.callNotes,
      actionsTaken: form.actionsTaken,
      version: form.version,
    });
  };

  const handleAssign = () => {
    if (form.assignedAgentId === report.assignedAgentId) return;
    assignReport.mutate(
      { toAgentId: form.assignedAgentId, note: assignNote || undefined },
      {
        onSuccess: (updated) => {
          setForm(toFormState(updated));
          setAssignNote("");
        },
      },
    );
  };

  const handleComment = () => {
    const body = comment.trim();
    if (!body) return;
    addComment.mutate(
      { body },
      {
        onSuccess: () => setComment(""),
      },
    );
  };

  return (
    <div className="relative space-y-6 p-5">
      {isBusy && (
        <div
          className="absolute inset-0 z-10 cursor-wait"
          aria-hidden
        />
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[12px] text-text-secondary">{report.id}</p>
          <h3 className="mt-1 text-[16px] font-semibold text-text-primary">{report.issueName}</h3>
          <p className="mt-1 text-[12px] text-text-secondary">
            Created {formatActivityTimestamp(report.createdAt)} · {report.customerName} ·{" "}
            {report.propertyName}
          </p>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <section className="space-y-3 rounded-xl border border-border-color p-4">
        <h4 className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">
          Caller & booking
        </h4>
        <Field label="Caller name">
          <Input
            value={form.callerName}
            onChange={(v) => update("callerName", v)}
            readOnly={!canEdit}
          />
        </Field>
        <Field label="Caller contact">
          <Input
            value={form.callerContact}
            onChange={(v) => update("callerContact", v)}
            readOnly={!canEdit}
          />
        </Field>
        <Field label="Reservation">
          <Input
            value={form.reservationNumber}
            onChange={(v) => update("reservationNumber", v)}
            readOnly={!canEdit}
          />
        </Field>
        <Field label="Name on booking">
          <Input
            value={form.nameOnBooking}
            onChange={(v) => update("nameOnBooking", v)}
            readOnly={!canEdit}
          />
        </Field>
      </section>

      <section className="space-y-3 rounded-xl border border-border-color p-4">
        <h4 className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">
          Issue & priority
        </h4>
        <Field label="Issue summary">
          <Input
            value={form.issueName}
            onChange={(v) => update("issueName", v)}
            readOnly={!canEdit}
          />
        </Field>
        <Field label="Issue type">
          <Select
            value={form.issueType}
            onChange={(v) => update("issueType", v)}
            options={INCIDENT_TYPES}
            disabled={!canEdit}
          />
        </Field>
        <Field label="Priority">
          <Select
            value={form.priority}
            onChange={(v) => update("priority", v as Priority)}
            options={Object.keys(priorityMeta) as Priority[]}
            disabled={!canEdit}
          />
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(v) => update("status", v as ReportStatus)}
            options={Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]}
            optionLabels={REPORT_STATUS_LABELS}
            disabled={!canEdit}
          />
        </Field>
      </section>

      <section className="space-y-3 rounded-xl border border-border-color p-4">
        <h4 className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">
          Actions & notes
        </h4>
        <div className="flex flex-wrap gap-2">
          {ACTION_CHIPS.map((chip) => {
            const active = form.actionsTaken.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                disabled={!canEdit}
                onClick={() => toggleAction(chip)}
                className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                  active
                    ? "border-brand-primary/30 bg-brand-primary/10 text-brand-primary"
                    : "border-border-color bg-white text-text-secondary"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
        <Field label="Call notes">
          <Textarea
            value={form.callNotes}
            onChange={(v) => update("callNotes", v)}
            readOnly={!canEdit}
            rows={5}
          />
        </Field>
      </section>

      <section className="space-y-3 rounded-xl border border-border-color p-4">
        <h4 className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">
          Assignment
        </h4>
        <Field label="Assigned agent">
          <Select
            value={form.assignedAgentId}
            onChange={(v) => update("assignedAgentId", v)}
            options={agents.map((a) => a.id)}
            optionLabels={Object.fromEntries(agents.map((a) => [a.id, a.name]))}
            disabled={!canAssign}
          />
        </Field>
        {canAssign && form.assignedAgentId !== report.assignedAgentId && (
          <>
            <Field label="Assignment note (optional)">
              <Input value={assignNote} onChange={setAssignNote} />
            </Field>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAssign}
              loading={assignReport.isPending}
            >
              Reassign
            </Button>
          </>
        )}
      </section>

      {canEdit && (
        <Button type="button" onClick={handleSave} loading={updateReport.isPending}>
          Save changes
        </Button>
      )}

      <section className="space-y-3 rounded-xl border border-border-color p-4">
        <h4 className="text-[12px] font-bold uppercase tracking-wide text-text-secondary">
          Activity
        </h4>
        <ReportThread entries={thread} />
        <Field label="Add follow-up">
          <Textarea value={comment} onChange={setComment} rows={3} placeholder="Write a comment…" />
        </Field>
        <Button
          type="button"
          variant="secondary"
          onClick={handleComment}
          loading={addComment.isPending}
          disabled={!comment.trim()}
        >
          Post comment
        </Button>
      </section>
    </div>
  );
}
