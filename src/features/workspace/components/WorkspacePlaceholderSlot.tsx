import { cn } from "@/lib/utils";
import { WORKSPACE_FIELD_WIDTH } from "@/features/workspace/components/WorkspaceSelectionChip";
import type { ReactNode } from "react";

export function WorkspacePlaceholderSlot({
  icon,
  label,
  active = false,
  className,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-md border px-3 shadow-sm",
        active
          ? "border-primary/70 bg-primary/[0.04] ring-2 ring-primary/15"
          : "border-border bg-surface/60 opacity-50",
        WORKSPACE_FIELD_WIDTH,
        className,
      )}
    >
      <span className={cn("shrink-0", active ? "text-muted-foreground" : "text-muted-foreground/70")}>
        {icon}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[13px] font-medium",
          active ? "text-muted-foreground" : "text-muted-foreground/70",
        )}
      >
        {label}
      </span>
    </div>
  );
}
