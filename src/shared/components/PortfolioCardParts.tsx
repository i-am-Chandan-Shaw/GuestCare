import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import type { ReactNode } from "react";

export const PORTFOLIO_CARD_TITLE_CLASS =
  "text-[17px] font-semibold leading-snug tracking-tight text-card-text";

export function portfolioCardClassName() {
  return cn(
    "group w-full cursor-pointer rounded-lg border border-[#e9e9e7] bg-white text-left",
    "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow]",
    "hover:border-[#ddd] hover:shadow-[0_2px_10px_rgba(0,0,0,0.06)]",
  );
}

export function PortfolioCardActivityChip({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-[#e9e9e7] bg-[#f5f5f3] px-2 py-0.5 text-[11px] font-semibold text-card-subtext shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <Clock className="h-3 w-3 shrink-0 text-card-subtext" strokeWidth={1.75} />
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#e9e9e7] bg-white text-[#8e8e8e] transition-colors hover:border-[#ddd] hover:bg-[#fafaf8] hover:text-[#5a5a5a]"
    >
      {children}
    </button>
  );
}

type MetricTone = "neutral" | "warning" | "success";

const metricToneClass: Record<MetricTone, { icon: string; label: string }> = {
  neutral: { icon: "text-card-subtext/80", label: "text-card-subtext" },
  warning: { icon: "text-warning/80", label: "text-warning/90" },
  success: { icon: "text-success/80", label: "text-success/90" },
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
    <div className={cn("flex min-w-0 flex-1 flex-col gap-2", className)}>
      <div className="flex items-center gap-1.5">
        <span className={cn("shrink-0 [&>svg]:h-4 [&>svg]:w-4", colors.icon)}>{icon}</span>
        <p className={cn("text-[11px] font-semibold uppercase tracking-wide", colors.label)}>{label}</p>
      </div>
      <div
        className={cn(
          "text-[17px] font-medium leading-snug tracking-tight text-card-text",
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
      <div className="h-px w-full bg-[#efefed]" aria-hidden />
      <div className="flex items-stretch justify-between gap-6 px-6 py-5">{children}</div>
    </>
  );
}

export function PortfolioCardHeader({ children }: { children: ReactNode }) {
  return <div className="px-6 pb-4 pt-5">{children}</div>;
}
