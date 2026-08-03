import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type StatusTone =
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "brand"
  | "muted";

const toneClass: Record<StatusTone, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
  muted: "bg-text-secondary/10 text-text-secondary border-text-secondary/20",
};

export function StatusChip({
  children,
  tone = "brand",
  className,
}: {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[24px] items-center gap-1.5 rounded-full border px-2 text-[11px] font-semibold",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
