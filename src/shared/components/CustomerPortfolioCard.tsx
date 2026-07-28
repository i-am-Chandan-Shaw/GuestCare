import {
  formatCompactRelativeTime,
} from "@/shared/lib/format-relative-time";
import {
  PORTFOLIO_CARD_TITLE_CLASS,
  PortfolioCardActionButton,
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
  FilePlus2,
  User,
} from "lucide-react";

export function CustomerPortfolioCard({
  customer,
  onSelect,
  onCreateReport,
}: {
  customer: CustomerSummary;
  onSelect: () => void;
  onCreateReport?: () => void;
}) {
  const lastIssue = customer.lastIssue;
  const lastIssueTitle = lastIssue
    ? lastIssue.propertyLabel
      ? `${lastIssue.summary} — ${lastIssue.propertyLabel}`
      : lastIssue.summary
    : "—";
  const activityLabel = lastIssue ? formatCompactRelativeTime(lastIssue.timestamp) : null;

  const handleCreateReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    (onCreateReport ?? onSelect)();
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

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
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={PORTFOLIO_CARD_TITLE_CLASS}>{customer.name}</h3>
              {activityLabel && <PortfolioCardActivityChip label={activityLabel} />}
            </div>
            <p className="mt-1 text-[12px] font-medium text-card-subtext">
              {customer.email} | {customer.phone}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <PortfolioCardActionButton label="Create report" onClick={handleCreateReport}>
              <FilePlus2 className="h-4 w-4" strokeWidth={1.75} />
            </PortfolioCardActionButton>
            <PortfolioCardActionButton label="View customer" onClick={handleSelect}>
              <User className="h-4 w-4" strokeWidth={1.75} />
            </PortfolioCardActionButton>
          </div>
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
