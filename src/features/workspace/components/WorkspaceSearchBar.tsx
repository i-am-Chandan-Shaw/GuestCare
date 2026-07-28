import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import type { ReactNode } from "react";

export function WorkspaceSearchBar({
  value,
  onChange,
  placeholder,
  icon,
  className,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2.5 rounded-md border border-border bg-surface px-3 shadow-sm transition-colors",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "focus-within:border-primary/50",
        className,
      )}
    >
      <span className="shrink-0 text-muted-foreground">{icon ?? <User className="h-4 w-4" />}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-card-text outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  );
}
