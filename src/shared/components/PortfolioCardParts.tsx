import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

export const PORTFOLIO_CARD_TITLE_CLASS =
  "text-[17px] font-bold leading-snug tracking-tight text-text-primary";

export function portfolioCardClassName() {
  return cn(
    "group w-full cursor-pointer rounded-md border border-border-color bg-card-bg text-left shadow-none",
    "transition-[border-color,background-color,box-shadow] duration-200",
    "hover:border-input-border hover:bg-app-bg hover:shadow-[0_1px_3px_rgba(27,37,89,0.06),0_4px_12px_rgba(27,37,89,0.06)]",
  );
}

export function PortfolioCardActivityChip({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded border border-warning/20 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
      <Info className="h-3 w-3 shrink-0" strokeWidth={2} />
      {label}
    </span>
  );
}

export function PortfolioCardActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-color bg-card-bg text-text-secondary transition-colors hover:border-border-color hover:bg-app-bg hover:text-text-primary"
    >
      {children}
    </button>
  );
}

type MetricTone = "neutral" | "warning" | "success";

const metricToneClass: Record<MetricTone, { icon: string; label: string; value: string }> = {
  neutral: {
    icon: "text-text-muted",
    label: "text-text-muted",
    value: "text-text-primary",
  },
  warning: {
    icon: "text-warning/80",
    label: "text-warning/90",
    value: "text-warning",
  },
  success: {
    icon: "text-success/80",
    label: "text-success/90",
    value: "text-success",
  },
};

export function PortfolioMetricColumn({
  icon,
  label,
  value,
  tone = "neutral",
  className,
  valueClassName,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  tone?: MetricTone;
  className?: string;
  valueClassName?: string;
}) {
  const colors = metricToneClass[tone];

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <span className={cn("shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5", colors.icon)}>{icon}</span>
        <p className={cn("text-[8px] font-bold uppercase tracking-wide", colors.label)}>{label}</p>
      </div>
      <div
        className={cn(
          "text-[15px] font-semibold leading-snug tracking-tight",
          colors.value,
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function PortfolioCardMetricsRow({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="h-px w-full bg-border-color" aria-hidden />
      <div className="flex items-stretch justify-between gap-6 px-6 py-5">{children}</div>
    </>
  );
}

export function PortfolioCardHeader({ children }: { children: ReactNode }) {
  return <div className="px-6 pb-4 pt-5">{children}</div>;
}
