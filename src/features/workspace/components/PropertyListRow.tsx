import { formatCompactRelativeTime } from "@/shared/lib/format-relative-time";
import {
  PORTFOLIO_CARD_TITLE_CLASS,
  PortfolioCardActivityChip,
  PortfolioMetricColumn,
} from "@/shared/components/PortfolioCardParts";
import { PortfolioCardThumbnail } from "@/shared/components/PortfolioCardThumbnail";
import { cn } from "@/lib/utils";
import type { PropertySummary } from "@/shared/types";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, ClipboardList } from "lucide-react";

function MetricCell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-stretch border-l border-border-color pl-4 first:border-l-0 first:pl-0">
      {children}
    </div>
  );
}

export function PropertyListRow({
  property,
  onSelect,
  striped = false,
}: {
  property: PropertySummary;
  onSelect: () => void;
  striped?: boolean;
}) {
  const totalIssues = property.openReportsCount + property.resolvedCount;
  const activityLabel = property.lastIssue
    ? formatCompactRelativeTime(property.lastIssue.timestamp)
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
      className={cn(
        "group flex w-full cursor-pointer items-center gap-4 px-4 py-3.5 text-left transition-colors duration-200",
        striped ? "bg-grid-header-bg/40 hover:bg-grid-header-bg/60" : "hover:bg-app-bg",
      )}
    >
      <PortfolioCardThumbnail
        name={property.name}
        imageUrl={property.imageUrl}
        seed={property.id}
        className="h-[56px] w-[84px]"
      />

      <div className="min-w-0 w-[200px] shrink-0 border-r border-border-color pr-4">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className={cn(PORTFOLIO_CARD_TITLE_CLASS, "min-w-0 truncate text-[14px]")}>
            {property.name}
          </h3>
          {activityLabel && <PortfolioCardActivityChip label={activityLabel} />}
        </div>
        <p className="mt-0.5 truncate text-[12px] font-medium text-card-subtext">
          {property.address}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 items-stretch pl-4">
        <MetricCell>
          <PortfolioMetricColumn
            icon={<AlertCircle strokeWidth={1.75} />}
            label="Open Reports"
            value={property.openReportsCount}
          />
        </MetricCell>
        <MetricCell>
          <PortfolioMetricColumn
            icon={<CheckCircle2 strokeWidth={1.75} />}
            label="Resolved"
            value={property.resolvedCount}
          />
        </MetricCell>
        <MetricCell>
          <PortfolioMetricColumn
            icon={<ClipboardList strokeWidth={1.75} />}
            label="Total Reports"
            value={totalIssues}
          />
        </MetricCell>
      </div>

      <ChevronRight
        className="ml-2 h-4 w-4 shrink-0 text-text-muted transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-text-secondary"
        strokeWidth={1.75}
        aria-hidden
      />
    </article>
  );
}
