import { formatCompactRelativeTime } from "@/shared/lib/format-relative-time";
import {
  PORTFOLIO_CARD_TITLE_CLASS,
  PortfolioCardActivityChip,
  PortfolioCardHeader,
  PortfolioCardMetricsRow,
  PortfolioMetricColumn,
  portfolioCardClassName,
} from "@/shared/components/PortfolioCardParts";
import { PortfolioCardThumbnail } from "@/shared/components/PortfolioCardThumbnail";
import type { PropertySummary } from "@/shared/types";
import { AlertCircle, CheckCircle2, ClipboardList, Clock } from "lucide-react";

export function PropertyPortfolioCard({
  property,
  onSelect,
}: {
  property: PropertySummary;
  onSelect: () => void;
}) {
  const totalIssues = property.openReportsCount + property.resolvedCount;
  const lastIssueTitle = property.lastIssue?.summary ?? "—";
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
      className={portfolioCardClassName()}
    >
      <PortfolioCardHeader>
        <div className="flex items-start gap-4">
          <PortfolioCardThumbnail name={property.name} imageUrl={property.imageUrl} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={PORTFOLIO_CARD_TITLE_CLASS}>{property.name}</h3>
              {activityLabel && <PortfolioCardActivityChip label={activityLabel} />}
            </div>
            <p className="mt-1 truncate text-[12px] font-medium text-card-subtext">{property.address}</p>
          </div>
        </div>
      </PortfolioCardHeader>

      <PortfolioCardMetricsRow>
        <PortfolioMetricColumn
          icon={<AlertCircle strokeWidth={1.75} />}
          label="Open Issues"
          value={property.openReportsCount}
        />

        <PortfolioMetricColumn
          icon={<CheckCircle2 strokeWidth={1.75} />}
          label="Resolved"
          value={property.resolvedCount}
        />

        <PortfolioMetricColumn
          icon={<ClipboardList strokeWidth={1.75} />}
          label="Total Issues"
          value={totalIssues}
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
