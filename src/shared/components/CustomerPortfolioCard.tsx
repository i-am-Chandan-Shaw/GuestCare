import {
  formatCompactRelativeTime,
} from "@/shared/lib/format-relative-time";
import {
  PORTFOLIO_CARD_TITLE_CLASS,
  PortfolioCardActivityChip,
  PortfolioCardHeader,
  PortfolioCardMetricsRow,
  PortfolioMetricColumn,
  portfolioCardClassName,
} from "@/shared/components/PortfolioCardParts";
import type { CustomerSummary } from "@/shared/types";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
} from "lucide-react";

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
      className={portfolioCardClassName()}
    >
      <PortfolioCardHeader>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={PORTFOLIO_CARD_TITLE_CLASS}>{customer.name}</h3>
            {activityLabel && <PortfolioCardActivityChip label={activityLabel} />}
          </div>
          <p className="mt-1 text-[12px] font-medium text-card-subtext">
            {customer.email} | {customer.phone}
          </p>
        </div>
      </PortfolioCardHeader>

      <PortfolioCardMetricsRow>
        <PortfolioMetricColumn
          icon={<Building2 strokeWidth={1.75} />}
          label="Properties"
          value={customer.propertyCount}
        />

        <PortfolioMetricColumn
          icon={<ClipboardList strokeWidth={1.75} />}
          label="Total Issues"
          value={customer.totalIssuesCount}
        />

        <PortfolioMetricColumn
          icon={<AlertCircle strokeWidth={1.75} />}
          label="Open Issues"
          value={customer.openReportsCount}
        />

        <PortfolioMetricColumn
          icon={<CheckCircle2 strokeWidth={1.75} />}
          label="Resolved"
          value={customer.resolvedCount}
        />

        <PortfolioMetricColumn
          icon={<Clock strokeWidth={1.75} />}
          label="Last Issue"
          value={
            <span className="block truncate">{lastIssueTitle}</span>
          }
          className="min-w-[200px] flex-[1.35]"
        />
      </PortfolioCardMetricsRow>
    </article>
  );
}
