import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, CornerUpLeft, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { REPORT_STATUS_LABELS, REPORT_STATUS_TONES } from "@/features/reports/lib/report-status";
import { Avatar } from "@/shared/components/Avatar";
import { formatActivityTimestamp, formatActivityTimestampRelative } from "@/shared/lib/datetime";
import type { ReportThreadEntry } from "@/shared/types/report";

export type ThreadSortOrder = "oldest" | "newest";

export function threadSummary(entry: ReportThreadEntry): string {
  switch (entry.type) {
    case "comment":
      return entry.body ?? "Comment";
    case "assignment": {
      const to = entry.metadata?.toAgentName ?? "another agent";
      if (entry.metadata?.action === "removed") {
        return `removed ${to}`;
      }
      return `added ${to}`;
    }
    case "status_change": {
      const from = entry.metadata?.fromStatus
        ? REPORT_STATUS_LABELS[entry.metadata.fromStatus]
        : "—";
      const to = entry.metadata?.toStatus ? REPORT_STATUS_LABELS[entry.metadata.toStatus] : "—";
      return `changed status from ${from} to ${to}`;
    }
    case "field_edit":
      return `updated ${entry.metadata?.changedFields?.join(", ") ?? "fields"}`;
    case "system":
    default:
      return entry.body ?? "System event";
  }
}

function CommentBody({
  entry,
  isReporter,
  canEdit,
  isRoot,
  onReply,
  onSaveEdit,
  editPending,
  replyCount,
  repliesExpanded,
  onToggleReplies,
}: {
  entry: ReportThreadEntry;
  isReporter: boolean;
  canEdit: boolean;
  isRoot: boolean;
  onReply?: () => void;
  onSaveEdit: (body: string) => void;
  editPending?: boolean;
  replyCount?: number;
  repliesExpanded?: boolean;
  onToggleReplies?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.body ?? "");

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="text-[13px] font-semibold text-text-primary">{entry.authorAgentName}</span>
        {isReporter ? (
          <span className="rounded bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
            Reporter
          </span>
        ) : null}
        <span
          className="text-[11.5px] text-text-muted"
          title={formatActivityTimestamp(entry.createdAt)}
        >
          {formatActivityTimestampRelative(entry.createdAt)}
        </span>
      </div>

      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input-border bg-card-bg px-3 py-2 text-[13px] text-text-primary outline-none focus:border-input-border-focus"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="default"
              loading={editPending}
              disabled={!draft.trim() || draft.trim() === (entry.body ?? "").trim()}
              onClick={() => {
                onSaveEdit(draft.trim());
                setEditing(false);
              }}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDraft(entry.body ?? "");
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-text-primary">
          {entry.body}
        </p>
      )}

      {!editing && (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {isRoot && onReply ? (
            <button
              type="button"
              onClick={onReply}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              <CornerUpLeft className="h-3.5 w-3.5" strokeWidth={2} />
              Reply
            </button>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              onClick={() => {
                setDraft(entry.body ?? "");
                setEditing(true);
              }}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
              Edit
            </button>
          ) : null}
          {isRoot && replyCount != null && replyCount > 0 && onToggleReplies ? (
            <button
              type="button"
              onClick={onToggleReplies}
              className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 py-0.5 pl-2 pr-1.5 text-[11px] font-semibold text-brand-primary transition-colors hover:bg-brand-primary/15"
            >
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
              {repliesExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function InlineReplyComposer({
  onSubmit,
  onCancel,
  pending,
}: {
  onSubmit: (body: string) => void;
  onCancel: () => void;
  pending?: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-border-color bg-app-bg px-3 py-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Reply to this conversation…"
        className="min-w-0 flex-1 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-muted"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && value.trim()) {
            e.preventDefault();
            onSubmit(value.trim());
            setValue("");
          }
        }}
      />
      <Button type="button" variant="ghost" onClick={onCancel} className="!h-8 !px-3 text-[12px]">
        Cancel
      </Button>
      <Button
        type="button"
        loading={pending}
        disabled={!value.trim()}
        onClick={() => {
          if (!value.trim()) return;
          onSubmit(value.trim());
          setValue("");
        }}
        className="!h-8 !px-3 text-[12px]"
      >
        Reply
      </Button>
    </div>
  );
}

export function ReportConversations({
  entries,
  reporterAgentId,
  currentActorId,
  sortOrder,
  onSortChange,
  onReply,
  onEdit,
  replyPending,
  editPending,
}: {
  entries: ReportThreadEntry[];
  reporterAgentId: string;
  currentActorId: string;
  sortOrder: ThreadSortOrder;
  onSortChange: (order: ThreadSortOrder) => void;
  onReply: (parentId: string, body: string) => void;
  onEdit: (commentId: string, body: string) => void;
  replyPending?: boolean;
  editPending?: boolean;
}) {
  const comments = useMemo(() => entries.filter((e) => e.type === "comment"), [entries]);

  const roots = useMemo(() => {
    const list = comments.filter((c) => !c.parentId);
    return [...list].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === "oldest" ? diff : -diff;
    });
  }, [comments, sortOrder]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string, ReportThreadEntry[]>();
    for (const c of comments) {
      if (!c.parentId) continue;
      const list = map.get(c.parentId) ?? [];
      list.push(c);
      map.set(c.parentId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return map;
  }, [comments]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const isExpanded = (id: string) => expanded[id] !== false;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold text-text-primary">
          Conversations <span className="font-normal text-text-secondary">({comments.length})</span>
        </h2>
        <label className="relative inline-flex items-center">
          <span className="sr-only">Sort conversations</span>
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as ThreadSortOrder)}
            className="h-9 appearance-none rounded-lg border border-border-color bg-card-bg py-0 pl-3 pr-8 text-[12px] font-medium text-text-primary outline-none transition-colors hover:border-text-secondary/30 focus:border-input-border-focus"
          >
            <option value="oldest">Oldest first</option>
            <option value="newest">Newest first</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-primary"
            strokeWidth={2}
            aria-hidden
          />
        </label>
      </div>

      {roots.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-color bg-app-bg px-4 py-8 text-center text-[13px] text-text-secondary">
          No comments yet. Start the conversation below.
        </p>
      ) : (
        <ul className="space-y-5">
          {roots.map((root) => {
            const children = childrenByParent.get(root.id) ?? [];
            const open = isExpanded(root.id);
            const showThread = children.length > 0 && open;

            return (
              <li key={root.id}>
                <div className="flex gap-3">
                  <div className="flex w-9 shrink-0 flex-col items-center self-stretch">
                    <div className="relative z-[1] shrink-0 rounded-full bg-card-bg">
                      <Avatar name={root.authorAgentName} seed={root.authorAgentId} size="md" />
                    </div>
                    {showThread ? (
                      <div
                        className="w-0 flex-1 border-l border-dashed border-border-color"
                        aria-hidden
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <CommentBody
                      entry={root}
                      isReporter={root.authorAgentId === reporterAgentId}
                      canEdit={root.authorAgentId === currentActorId}
                      isRoot
                      onReply={() => setReplyingTo(root.id)}
                      onSaveEdit={(body) => onEdit(root.id, body)}
                      editPending={editPending}
                      replyCount={children.length}
                      repliesExpanded={open}
                      onToggleReplies={
                        children.length > 0
                          ? () =>
                              setExpanded((prev) => ({
                                ...prev,
                                [root.id]: !isExpanded(root.id),
                              }))
                          : undefined
                      }
                    />
                  </div>
                </div>

                {showThread ? (
                  <ul>
                    {children.map((child, index) => {
                      const isLast = index === children.length - 1;
                      return (
                        <li key={child.id} className="flex gap-3">
                          <div className="relative w-9 shrink-0">
                            <span
                              className={cn(
                                "pointer-events-none absolute left-1/2 w-0 -translate-x-px border-l border-dashed border-border-color",
                                isLast ? "top-0 h-[26px]" : "inset-y-0",
                              )}
                              aria-hidden
                            />
                            <span
                              className="pointer-events-none absolute left-1/2 top-[26px] h-0 w-[calc(50%+0.75rem)] border-t border-dashed border-border-color"
                              aria-hidden
                            />
                            <span
                              className="pointer-events-none absolute left-1/2 top-[22px] z-[1] h-2 w-2 -translate-x-1/2 rounded-full bg-border-color"
                              aria-hidden
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 gap-3 pt-3">
                            <div className="relative z-[1] shrink-0 rounded-full bg-card-bg">
                              <Avatar
                                name={child.authorAgentName}
                                seed={child.authorAgentId}
                                size="sm"
                              />
                            </div>
                            <CommentBody
                              entry={child}
                              isReporter={child.authorAgentId === reporterAgentId}
                              canEdit={child.authorAgentId === currentActorId}
                              isRoot={false}
                              onSaveEdit={(body) => onEdit(child.id, body)}
                              editPending={editPending}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                {replyingTo === root.id ? (
                  <div className="mt-2 flex gap-3">
                    <div className="w-9 shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <InlineReplyComposer
                        pending={replyPending}
                        onCancel={() => setReplyingTo(null)}
                        onSubmit={(body) => {
                          onReply(root.id, body);
                          setReplyingTo(null);
                          setExpanded((prev) => ({ ...prev, [root.id]: true }));
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function ReportStatusBadge({ status }: { status: keyof typeof REPORT_STATUS_LABELS }) {
  const tone = REPORT_STATUS_TONES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        tone === "success" && "border-success/30 bg-success/10 text-success",
        tone === "warning" && "border-warning/30 bg-warning/10 text-warning",
        tone === "danger" && "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "info" && "border-info/30 bg-info/10 text-info",
      )}
    >
      {status === "RESOLVED" ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
      {REPORT_STATUS_LABELS[status]}
    </span>
  );
}
