import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function WorkspaceEmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full flex-col items-center justify-center bg-background p-8", className)}>
      <div className="w-full max-w-sm rounded-sm border border-dashed border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <h2 className="mt-4 text-[16px] font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
