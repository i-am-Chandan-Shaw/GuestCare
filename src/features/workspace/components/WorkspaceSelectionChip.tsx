import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function WorkspaceSelectionChip({
  label,
  onClear,
  icon,
  className,
}: {
  label: string;
  onClear: () => void;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-md border border-border bg-surface px-3 shadow-sm",
        className,
      )}
    >
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-card-text">{label}</span>
      <button
        type="button"
        aria-label={`Clear ${label}`}
        onClick={onClear}
        className="shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-card-text"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

export const WORKSPACE_FIELD_WIDTH = "w-[220px] shrink-0";
