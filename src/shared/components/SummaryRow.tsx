import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export function SummaryRow({
  title,
  subtitle,
  meta,
  trailing,
  onClick,
  isSelected = false,
  statusTone,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  statusTone?: "open" | "resolved" | "neutral";
}) {
  const Comp = onClick ? "button" : "div";
  const toneClass =
    statusTone === "open"
      ? "bg-warning/10 text-warning border-warning/20"
      : statusTone === "resolved"
        ? "bg-success/10 text-success border-success/20"
        : "";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 rounded-lg border border-border/80 bg-card px-4 py-3 text-left shadow-sm transition-all",
        onClick && "cursor-pointer hover:border-primary/35 hover:shadow-md",
        isSelected && "border-primary/50 bg-primary/5",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[14px] font-semibold text-foreground">{title}</div>
          {statusTone && statusTone !== "neutral" && (
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", toneClass)}>
              {statusTone}
            </span>
          )}
        </div>
        {subtitle && <div className="mt-0.5 text-[12.5px] text-muted-foreground">{subtitle}</div>}
        {meta && <div className="mt-1 text-[12px] font-medium text-foreground/70">{meta}</div>}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
        {trailing}
        {onClick && <ChevronRight className="h-4 w-4" />}
      </div>
    </Comp>
  );
}
