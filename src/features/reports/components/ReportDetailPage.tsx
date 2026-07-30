import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Check,
  ChevronLeft,
  Code2,
  Copy,
  Italic,
  Link2,
  List,
  ListOrdered,
  Smile,
  Strikethrough,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/features/incidents/components/incident-form-controls";
import {
  useAddReportCommentMutation,
  useAssignReportMutation,
  useAssignmentAgentsQuery,
  useReportActor,
  useReportDetailQuery,
  useUpdateReportCommentMutation,
  useUpdateReportMutation,
} from "@/features/reports/hooks/useReports";
import {
  ReportConversations,
  ReportStatusBadge,
  type ThreadSortOrder,
} from "@/features/reports/components/ReportThread";
import { REPORT_STATUS_LABELS } from "@/features/reports/lib/report-status";
import { agentCanAssignReport, agentCanEditReport } from "@/features/reports/lib/report-scope";
import { priorityMeta } from "@/shared/constants/agent";
import { INCIDENT_TYPES } from "@/shared/constants/incident";
import {
  formatActivityTimestamp,
  formatActivityTimestampRelative,
} from "@/shared/lib/datetime";
import type { Priority } from "@/shared/types";
import type { Report, ReportStatus } from "@/shared/types/report";

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

function formatReportId(id: string) {
  return id.replaceAll("-", "");
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after = before,
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end) || "text";
  return value.slice(0, start) + before + selected + after + value.slice(end);
}

function CommentComposer({
  value,
  onChange,
  onSubmit,
  pending,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  pending?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (before: string, after?: string) => {
    const el = ref.current;
    if (!el) {
      onChange(`${before}${value || "text"}${after ?? before}`);
      return;
    }
    onChange(wrapSelection(el, before, after));
  };

  const tools = [
    { icon: Bold, label: "Bold", run: () => applyFormat("**") },
    { icon: Italic, label: "Italic", run: () => applyFormat("_") },
    { icon: Strikethrough, label: "Strikethrough", run: () => applyFormat("~~") },
    { icon: List, label: "Bullet list", run: () => applyFormat("\n- ", "") },
    { icon: ListOrdered, label: "Numbered list", run: () => applyFormat("\n1. ", "") },
    { icon: Code2, label: "Code", run: () => applyFormat("`") },
    { icon: Link2, label: "Link", run: () => applyFormat("[", "](url)") },
    { icon: Smile, label: "Emoji", run: () => applyFormat("", " 🙂") },
  ] as const;

  return (
    <div className="rounded-xl border border-border-color bg-card-bg p-3 shadow-sm">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Leave a comment…"
        className="w-full resize-y bg-transparent px-1 py-1 text-[13px] leading-relaxed text-text-primary outline-none placeholder:text-text-muted"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border-color pt-3">
        <div className="flex flex-wrap items-center gap-0.5">
          {tools.map(({ icon: Icon, label, run }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              onClick={run}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-app-bg hover:text-text-primary"
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </button>
          ))}
        </div>
        <Button type="button" onClick={onSubmit} loading={pending} disabled={!value.trim()}>
          Comment
        </Button>
      </div>
    </div>
  );
}

export function ReportDetailPage({
  reportId,
  onBack,
}: {
  reportId: string;
  onBack: () => void;
}) {
  const actor = useReportActor();
  const { data, isLoading } = useReportDetailQuery(reportId);
  const { data: agents = [] } = useAssignmentAgentsQuery();
  const updateReport = useUpdateReportMutation(reportId);
  const assignReport = useAssignReportMutation(reportId);
  const addComment = useAddReportCommentMutation(reportId);
  const updateComment = useUpdateReportCommentMutation(reportId);

  const [form, setForm] = useState<ReportFormState | null>(null);
  const [comment, setComment] = useState("");
  const [assignNote, setAssignNote] = useState("");
  const [sortOrder, setSortOrder] = useState<ThreadSortOrder>("oldest");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data?.report) {
      setForm(toFormState(data.report));
    } else {
      setForm(null);
    }
  }, [data?.report, reportId]);

  if (isLoading || !form) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center text-[13px] text-text-secondary">
        Loading report…
      </div>
    );
  }

  if (!data?.report) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-app-bg">
        <div className="flex shrink-0 items-center gap-2 border-b border-border-color bg-card-bg px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to reports"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-app-bg hover:text-text-primary"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <h2 className="text-[14px] font-bold text-text-primary">Report</h2>
        </div>
        <p className="p-6 text-[13px] text-text-secondary">
          Report not found or you don&apos;t have access.
        </p>
      </div>
    );
  }

  const { report, thread } = data;
  const canEdit = agentCanEditReport(actor, report);
  const canAssign = agentCanAssignReport(actor, report);
  const priority = priorityMeta[form.priority];
  const displayId = formatReportId(report.id);

  const update = <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const isBusy =
    updateReport.isPending ||
    assignReport.isPending ||
    addComment.isPending ||
    updateComment.isPending;

  const handleCancel = () => {
    setForm(toFormState(report));
    setAssignNote("");
  };

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

    if (canAssign && form.assignedAgentId !== report.assignedAgentId) {
      assignReport.mutate({
        toAgentId: form.assignedAgentId,
        note: assignNote || undefined,
      });
    }
  };

  const handleRootComment = () => {
    const body = comment.trim();
    if (!body) return;
    addComment.mutate(
      { body },
      {
        onSuccess: () => setComment(""),
      },
    );
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(displayId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-app-bg">
      {isBusy && <div className="absolute inset-0 z-10 cursor-wait" aria-hidden />}

      <div className="flex shrink-0 items-center gap-2 border-b border-border-color bg-card-bg px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to reports"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-app-bg hover:text-text-primary"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] tabular-nums text-text-secondary">{displayId}</p>
          <h2 className="truncate text-[14px] font-bold text-text-primary">{report.issueName}</h2>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid w-full gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(380px,42%)] lg:items-start">
          <div className="min-w-0 space-y-4">
            <article className="rounded-md border border-border-color bg-card-bg p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-[12px] font-bold text-brand-primary"
                    aria-hidden
                  >
                    {initialsFromName(report.callerName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-[14px] font-semibold text-text-primary">
                        {report.callerName}
                      </span>
                      <span
                        className="text-[12px] text-text-muted"
                        title={formatActivityTimestamp(report.createdAt)}
                      >
                        {formatActivityTimestampRelative(report.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-text-secondary">
                      {report.customerName} · {report.propertyName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyId}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[12px] text-text-secondary transition-colors hover:bg-app-bg hover:text-text-primary"
                  title="Copy report ID"
                >
                  #{displayId}
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                </button>
              </div>

              <h1 className="mt-4 text-[22px] font-bold leading-tight tracking-tight text-text-primary">
                {report.issueName}
              </h1>
              <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-text-primary/90">
                {report.callNotes.trim() || "No call notes recorded."}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                  {report.issueType}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${priority.tone}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                  {priority.name}
                </span>
                <ReportStatusBadge status={report.status} />
              </div>
            </article>

            <div className="rounded-md border border-border-color bg-card-bg p-5 shadow-sm">
              <ReportConversations
                entries={thread}
                reporterAgentId={report.createdByAgentId}
                currentActorId={actor.id}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                replyPending={addComment.isPending}
                editPending={updateComment.isPending}
                onReply={(parentId, body) => {
                  addComment.mutate({ body, parentId });
                }}
                onEdit={(commentId, body) => {
                  updateComment.mutate({ commentId, input: { body } });
                }}
              />
            </div>

            <CommentComposer
              value={comment}
              onChange={setComment}
              onSubmit={handleRootComment}
              pending={addComment.isPending}
            />
          </div>

          <aside className="lg:sticky lg:top-4">
            <div className="overflow-hidden rounded-md border border-border-color bg-card-bg shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-border-color px-4 py-3">
                <h2 className="text-[14px] font-semibold text-text-primary">Edit issue</h2>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" onClick={handleCancel} className="!h-8 !px-3">
                    Cancel
                  </Button>
                  {canEdit || canAssign ? (
                    <Button
                      type="button"
                      onClick={handleSave}
                      loading={updateReport.isPending || assignReport.isPending}
                      className="!h-8 !px-3"
                    >
                      Save changes
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="max-h-[calc(100vh-8rem)] space-y-5 overflow-y-auto p-4">
                <section className="space-y-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
                    Issue information
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Issue summary">
                        <Input
                          value={form.issueName}
                          onChange={(v) => update("issueName", v)}
                          readOnly={!canEdit}
                        />
                      </Field>
                    </div>
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
                        optionLabels={Object.fromEntries(
                          (Object.keys(priorityMeta) as Priority[]).map((key) => [
                            key,
                            priorityMeta[key].name,
                          ]),
                        )}
                        disabled={!canEdit}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Status">
                        <Select
                          value={form.status}
                          onChange={(v) => update("status", v as ReportStatus)}
                          options={Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]}
                          optionLabels={REPORT_STATUS_LABELS}
                          disabled={!canEdit}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Call notes">
                        <Textarea
                          value={form.callNotes}
                          onChange={(v) => update("callNotes", v)}
                          readOnly={!canEdit}
                          rows={4}
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                <section className="space-y-3 border-t border-border-color pt-5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
                    Caller & booking
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                  </div>
                </section>

                <section className="space-y-3 border-t border-border-color pt-5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-text-muted">
                    Additional context
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Property">
                      <Input value={report.propertyName} readOnly />
                    </Field>
                    <Field label="Assigned to">
                      <Select
                        value={form.assignedAgentId}
                        onChange={(v) => update("assignedAgentId", v)}
                        options={agents.map((a) => a.id)}
                        optionLabels={Object.fromEntries(agents.map((a) => [a.id, a.name]))}
                        disabled={!canAssign}
                      />
                    </Field>
                    {canAssign && form.assignedAgentId !== report.assignedAgentId && (
                      <div className="sm:col-span-2">
                        <Field label="Assignment note (optional)">
                          <Input value={assignNote} onChange={setAssignNote} />
                        </Field>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
