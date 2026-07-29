import { formatCompactRelativeTime } from "@/shared/lib/format-relative-time";
import {
  PORTFOLIO_CARD_TITLE_CLASS,
  PortfolioCardActivityChip,
  PortfolioMetricColumn,
  portfolioCardClassName,
} from "@/shared/components/PortfolioCardParts";
import { cn } from "@/lib/utils";
import type { CustomerSummary } from "@/shared/types";
import type { ReactNode } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
} from "lucide-react";

function MetricCell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-stretch border-l border-border-color pl-4 first:border-l-0 first:pl-0">
      {children}
    </div>
  );
}

export function CustomerPortfolioCard({
  customer,
  onSelect,
}: {
  customer: CustomerSummary;
  onSelect: () => void;
}) {
  const lastIssue = customer.lastIssue;
  const lastIssueTitle = lastIssue
    ? lastIssue.propertyLabel
      ? `${lastIssue.summary} — ${lastIssue.propertyLabel}`
      : lastIssue.summary
    : "—";
  const activityLabel = lastIssue ? formatCompactRelativeTime(lastIssue.timestamp) : null;

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
      className={cn(portfolioCardClassName(), "flex items-center gap-0 px-5 py-4")}
    >
      <div className="min-w-0 w-[240px] shrink-0 border-r border-border-color pr-4">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className={cn(PORTFOLIO_CARD_TITLE_CLASS, "min-w-0 truncate text-[15px]")}>
            {customer.name}
          </h3>
          {activityLabel && <PortfolioCardActivityChip label={activityLabel} />}
        </div>
        <p className="mt-0.5 truncate text-[12px] font-medium text-card-subtext">{customer.email}</p>
        <p className="truncate text-[12px] font-medium text-card-subtext">{customer.phone}</p>
      </div>

      <div className="flex min-w-0 flex-1 items-stretch pl-4 pr-6">
        <MetricCell>
          <PortfolioMetricColumn
            icon={<Building2 strokeWidth={1.75} />}
            label="Properties"
            value={customer.propertyCount}
          />
        </MetricCell>

        <MetricCell>
          <PortfolioMetricColumn
            icon={<ClipboardList strokeWidth={1.75} />}
            label="Total Issues"
            value={customer.totalIssuesCount}
          />
        </MetricCell>

        <MetricCell>
          <PortfolioMetricColumn
            icon={<AlertCircle strokeWidth={1.75} />}
            label="Open Issues"
            value={customer.openReportsCount}
          />
        </MetricCell>

        <MetricCell>
          <PortfolioMetricColumn
            icon={<CheckCircle2 strokeWidth={1.75} />}
            label="Resolved"
            value={customer.resolvedCount}
          />
        </MetricCell>

        <MetricCell>
          <PortfolioMetricColumn
            icon={<Clock strokeWidth={1.75} />}
            label="Last Issue"
            value={<span className="block truncate text-[12px] font-semibold">{lastIssueTitle}</span>}
            className="min-w-0 max-w-[200px] flex-[1.2]"
          />
        </MetricCell>
      </div>

      <ChevronRight
        className="ml-6 mr-1 h-4 w-4 shrink-0 text-text-muted transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-text-secondary"
        strokeWidth={1.75}
        aria-hidden
      />
    </article>
  );
}
