import { copyText } from "@/lib/copy-to-clipboard";
import { useState, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  Copy,
  Pencil,
  Phone,
  User,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useAddReportAssigneeMutation,
  useAddReportCommentMutation,
  useAssignmentAgentsQuery,
  useRemoveReportAssigneeMutation,
  useAgentAccess,
  useReportDetailQuery,
  useUpdateReportCommentMutation,
  useUpdateReportMutation,
} from "@/features/reports/hooks/useReports";
import {
  ReportConversations,
  ReportStatusBadge,
  type ThreadSortOrder,
} from "@/features/reports/components/ReportThread";
import { ReportActivityTimeline } from "@/features/reports/components/ReportActivityTimeline";
import { ReportMembers } from "@/features/reports/components/ReportMembers";
import { ReportEditDialog } from "@/features/reports/components/ReportEditDialog";
import { agentCanAssignReport, agentCanEditReport } from "@/features/reports/lib/report-scope";
import { priorityMeta } from "@/shared/constants/agent";
import { Avatar } from "@/shared/components/Avatar";
import { cn } from "@/lib/utils";
import { formatActivityTimestamp, formatActivityTimestampRelative } from "@/shared/lib/datetime";
import type { Report } from "@/shared/types/report";

function formatReportId(id: string) {
  return id.replaceAll("-", "");
}

const ICON_TONES = {
  blue: "bg-sky-500/10 text-sky-600",
  green: "bg-emerald-500/10 text-emerald-600",
  purple: "bg-violet-500/10 text-violet-600",
  amber: "bg-amber-500/10 text-amber-600",
} as const;

type IconTone = keyof typeof ICON_TONES;

function ToneIcon({
  icon: Icon,
  tone,
  size = "md",
}: {
  icon: LucideIcon;
  tone: IconTone;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md",
        ICON_TONES[tone],
        size === "sm" ? "h-7 w-7" : "h-8 w-8",
      )}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2} />
    </span>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border-color bg-card-bg p-5 sm:p-6 shadow-sm">
      <h3 className="mb-5 text-[14px] font-bold text-text-primary">{title}</h3>
      {children}
    </section>
  );
}

function DetailItem({
  label,
  value,
  icon,
  iconTone,
  className,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconTone: IconTone;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[11px] font-medium text-text-muted">{label}</p>
      <div className="mt-2 flex min-w-0 items-center gap-2.5">
        <ToneIcon icon={icon} tone={iconTone} size="sm" />
        <span className="truncate text-[13px] font-semibold text-text-primary">{value || "—"}</span>
      </div>
    </div>
  );
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
  return (
    <div className="rounded-md border border-border-color bg-card-bg p-3 shadow-sm">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="Leave a comment…"
        className="w-full resize-none bg-transparent px-1 py-1 text-[13px] leading-relaxed text-text-primary outline-none placeholder:text-text-muted"
      />
      <div className="mt-2 flex justify-end border-t border-border-color pt-3">
        <Button type="button" onClick={onSubmit} loading={pending} disabled={!value.trim()}>
          Comment
        </Button>
      </div>
    </div>
  );
}

function ReportDetailView({ report }: { report: Report }) {
  return (
    <div className="space-y-4 border-t border-border-color pt-6">
      <DetailSection title="Caller & booking">
        <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-3 sm:gap-y-0">
          <DetailItem
            label="Caller name"
            value={report.callerName}
            icon={User}
            iconTone="blue"
            className="sm:pr-5"
          />
          <DetailItem
            label="Caller contact"
            value={report.callerContact}
            icon={Phone}
            iconTone="green"
            className="sm:border-l sm:border-border-color sm:px-5"
          />
          <DetailItem
            label="Reservation"
            value={report.reservationNumber}
            icon={CalendarDays}
            iconTone="purple"
            className="sm:border-l sm:border-border-color sm:pl-5"
          />
          <DetailItem
            label="Name on booking"
            value={report.nameOnBooking}
            icon={User}
            iconTone="amber"
            className="sm:col-span-3 sm:mt-5 sm:border-t sm:border-border-color sm:pt-5"
          />
        </div>
      </DetailSection>

      <DetailSection title="Additional context">
        <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-3 sm:gap-y-0">
          <DetailItem
            label="Customer"
            value={report.customerName}
            icon={User}
            iconTone="purple"
            className="sm:pr-5"
          />
          <DetailItem
            label="Property"
            value={report.propertyName}
            icon={Building2}
            iconTone="blue"
            className="sm:border-l sm:border-border-color sm:px-5"
          />
          <DetailItem
            label="Reported by"
            value={report.createdByAgentName}
            icon={User}
            iconTone="green"
            className="sm:border-l sm:border-border-color sm:pl-5"
          />
        </div>
      </DetailSection>
    </div>
  );
}

export function ReportDetailPage({ reportId, onBack }: { reportId: string; onBack: () => void }) {
  const currentAgent = useAgentAccess();
  const { data, isLoading } = useReportDetailQuery(reportId);
  const { data: agents = [] } = useAssignmentAgentsQuery();
  const updateReport = useUpdateReportMutation(reportId);
  const addAssignee = useAddReportAssigneeMutation(reportId);
  const removeAssignee = useRemoveReportAssigneeMutation(reportId);
  const addComment = useAddReportCommentMutation(reportId);
  const updateComment = useUpdateReportCommentMutation(reportId);

  const [comment, setComment] = useState("");
  const [sortOrder, setSortOrder] = useState<ThreadSortOrder>("oldest");
  const [copied, setCopied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
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
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-app-bg text-text-secondary transition-colors hover:bg-border-color hover:text-text-primary"
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
  const canEdit = agentCanEditReport(currentAgent, report);
  const canAssign = agentCanAssignReport(currentAgent, report);
  const priority = priorityMeta[report.priority];
  const displayId = formatReportId(report.id);

  const isBusy =
    updateReport.isPending ||
    addAssignee.isPending ||
    removeAssignee.isPending ||
    addComment.isPending ||
    updateComment.isPending;

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
    const success = await copyText(displayId, "Report ID copied to clipboard");
    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
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
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-app-bg text-text-secondary transition-colors hover:bg-border-color hover:text-text-primary"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] tabular-nums text-text-secondary">{displayId}</p>
          <h2 className="truncate text-[14px] font-bold text-text-primary">{report.issueName}</h2>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <article className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg shadow-sm">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar name={report.callerName} seed={report.id} size="lg" />
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

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={copyId}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[12px] text-text-secondary transition-colors hover:bg-app-bg hover:text-text-primary"
                    title="Copy report ID"
                  >
                    #{displayId}
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
                    ) : (
                      <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                  </button>
                  {canEdit ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEditOpen(true)}
                      className="!h-8 !gap-1.5 !px-3"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                      Edit report
                    </Button>
                  ) : null}
                </div>
              </div>

              <h1 className="text-[22px] font-bold leading-tight tracking-tight text-text-primary">
                {report.issueName}
              </h1>

              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-text-primary/90">
                {report.callNotes.trim() || "No call notes recorded."}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <ReportMembers
                  variant="header"
                  assignees={report.assignees ?? []}
                  agents={agents}
                  canAssign={canAssign}
                  pending={addAssignee.isPending || removeAssignee.isPending}
                  onAdd={(agentId) => addAssignee.mutate({ agentId })}
                  onRemove={(agentId) => removeAssignee.mutate({ agentId })}
                />
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

              <ReportDetailView report={report} />

              <ReportActivityTimeline entries={thread} />
            </div>
          </article>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-border-color bg-card-bg p-5 shadow-sm">
            <ReportConversations
              entries={thread}
              reporterAgentId={report.createdByAgentId}
              currentAgentId={currentAgent.id}
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

          <div className="shrink-0 bg-app-bg pt-3">
            <CommentComposer
              value={comment}
              onChange={setComment}
              onSubmit={handleRootComment}
              pending={addComment.isPending}
            />
          </div>
        </div>
      </div>

      <ReportEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        report={report}
        pending={updateReport.isPending}
        onSave={(input) => {
          updateReport.mutate(input, {
            onSuccess: () => setEditOpen(false),
          });
        }}
      />
    </div>
  );
}
