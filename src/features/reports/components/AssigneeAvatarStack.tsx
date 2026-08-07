import { Avatar } from "@/shared/components/Avatar";
import { cn } from "@/lib/utils";
import type { ReportAssignee } from "@/shared/types/report";

export const ASSIGNEE_STACK_VISIBLE_LIMIT = 3;

/**
 * Read-only avatar stack matching ReportMembers: up to 3 avatars, then +N.
 */
export function AssigneeAvatarStack({
  assignees,
  size = "sm",
  className,
}: {
  assignees: ReportAssignee[];
  size?: "sm" | "md";
  className?: string;
}) {
  if (assignees.length === 0) {
    return <span className="text-[13px] text-text-muted">—</span>;
  }

  const overlaps = assignees.length > ASSIGNEE_STACK_VISIBLE_LIMIT;
  const visible = overlaps ? assignees.slice(0, ASSIGNEE_STACK_VISIBLE_LIMIT) : assignees;
  const hidden = overlaps ? assignees.slice(ASSIGNEE_STACK_VISIBLE_LIMIT) : [];
  const overflowLabel = hidden.map((member) => member.agentName).join(", ");

  return (
    <div
      className={cn("flex items-center", overlaps ? "-space-x-2" : "gap-1", className)}
      title={assignees.map((member) => member.agentName).join(", ")}
    >
      {visible.map((member) => (
        <Avatar
          key={member.agentId}
          name={member.agentName}
          seed={member.agentId}
          size={size}
          className={cn(overlaps && "ring-2 ring-card-bg")}
        />
      ))}
      {hidden.length > 0 ? (
        <span
          title={overflowLabel}
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-app-bg font-bold text-text-secondary ring-2 ring-card-bg",
            size === "sm" ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-[11px]",
          )}
        >
          +{hidden.length}
        </span>
      ) : null}
    </div>
  );
}
