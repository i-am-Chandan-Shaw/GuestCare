import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import {
  PORTFOLIO_CARD_TITLE_CLASS,
  PortfolioCardActivityChip,
  PortfolioCardThumbnail,
} from "@/shared/components/PortfolioCardThumbnail";
import { portfolioCardClassName } from "@/shared/components/PortfolioCardList";
import type { PropertySummary } from "@/shared/types";
import { AlertCircle, CheckCircle2, ClipboardList, Clock } from "lucide-react";
import type { ReactNode } from "react";

function MetricColumn({
  icon,
  iconClassName,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[52px] min-w-0 flex-1 items-center gap-3 px-5 first:pl-0 last:pr-0",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-card-subtext">{label}</p>
        <div className="mt-0.5 text-[18px] font-medium leading-none tracking-tight text-card-text">{value}</div>
      </div>
    </div>
  );
}

export function PropertyPortfolioCard({
  property,
  onSelect,
  alternate = false,
}: {
  property: PropertySummary;
  onSelect: () => void;
  alternate?: boolean;
}) {
  const totalIssues = property.openReportsCount + property.resolvedCount;
  const lastIssueTitle = property.lastIssue?.summary ?? "—";
  const lastActivity = property.lastIssue
    ? formatRelativeTime(property.lastIssue.timestamp)
    : null;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={portfolioCardClassName({ alternate })}
    >
      <div className="flex items-start gap-4 px-5 py-4">
        <PortfolioCardThumbnail name={property.name} imageUrl={property.imageUrl} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={PORTFOLIO_CARD_TITLE_CLASS}>{property.name}</h3>
            {lastActivity && (
              <PortfolioCardActivityChip>{lastActivity}</PortfolioCardActivityChip>
            )}
          </div>
          <p className="mt-1 truncate text-[12px] font-medium text-card-subtext">{property.address}</p>
        </div>
      </div>

      <div className="flex items-center px-5 pb-4 pt-0">
        <MetricColumn
          icon={<AlertCircle className="h-4 w-4 text-warning/80" strokeWidth={1.75} />}
          iconClassName="bg-warning/10"
          label="Open Issues"
          value={property.openReportsCount}
        />

        <div className="h-10 w-px shrink-0 bg-[#e9e9e7]" aria-hidden />

        <MetricColumn
          icon={<CheckCircle2 className="h-4 w-4 text-success/80" strokeWidth={1.75} />}
          iconClassName="bg-success/10"
          label="Resolved"
          value={property.resolvedCount}
        />

        <div className="h-10 w-px shrink-0 bg-[#e9e9e7]" aria-hidden />

        <MetricColumn
          icon={<ClipboardList className="h-4 w-4 text-primary/80" strokeWidth={1.75} />}
          iconClassName="bg-primary/8"
          label="Total Issues"
          value={totalIssues}
        />

        <div className="h-10 w-px shrink-0 bg-[#e9e9e7]" aria-hidden />

        <MetricColumn
          icon={<Clock className="h-4 w-4 text-[#7C3AED]/80" strokeWidth={1.75} />}
          iconClassName="bg-[#7C3AED]/8"
          label="Last Issue"
          value={
            <span className="block truncate text-[14px] font-medium leading-snug text-card-text">
              {lastIssueTitle}
            </span>
          }
          className="min-w-[200px] flex-[1.4]"
        />
      </div>
    </article>
  );
}
