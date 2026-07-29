import {
  PORTFOLIO_CARD_TITLE_CLASS,
  PortfolioCardActivityChip,
  PortfolioMetricColumn,
} from "@/shared/components/PortfolioCardParts";
import { formatCompactRelativeTime } from "@/shared/lib/format-relative-time";
import { cn } from "@/lib/utils";
import type { CustomerSummary } from "@/shared/types";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, ClipboardList, Clock } from "lucide-react";

function MetricCell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-stretch border-l border-border-color pl-4 first:border-l-0 first:pl-0">
      {children}
    </div>
  );
}

export function CustomerSummaryBanner({
  summary,
  address,
}: {
  summary: CustomerSummary;
  address: string;
}) {
  const lastIssue = summary.lastIssue;
  const lastIssueTitle = lastIssue
    ? lastIssue.propertyLabel
      ? `${lastIssue.summary} — ${lastIssue.propertyLabel}`
      : lastIssue.summary
    : "—";
  const activityLabel = lastIssue ? formatCompactRelativeTime(lastIssue.timestamp) : null;

  return (
    <div className="rounded-md border border-border-color bg-card-bg px-5 py-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h2 className={cn(PORTFOLIO_CARD_TITLE_CLASS, "text-[15px]")}>{summary.name}</h2>
        {activityLabel && <PortfolioCardActivityChip label={activityLabel} />}
      </div>
      <p className="mt-0.5 truncate text-[12px] font-medium text-card-subtext">{address}</p>

      <div className="mt-3 flex min-w-0 items-stretch">
        <MetricCell>
          <PortfolioMetricColumn
            icon={<AlertCircle strokeWidth={1.75} />}
            label="Open Issues"
            value={summary.openReportsCount}
          />
        </MetricCell>
        <MetricCell>
          <PortfolioMetricColumn
            icon={<CheckCircle2 strokeWidth={1.75} />}
            label="Resolved"
            value={summary.resolvedCount}
          />
        </MetricCell>
        <MetricCell>
          <PortfolioMetricColumn
            icon={<ClipboardList strokeWidth={1.75} />}
            label="Total Issues"
            value={summary.totalIssuesCount}
          />
        </MetricCell>
        <MetricCell>
          <PortfolioMetricColumn
            icon={<Clock strokeWidth={1.75} />}
            label="Last Issue"
            value={
              <span className="block truncate text-[12px] font-semibold">{lastIssueTitle}</span>
            }
            className="min-w-0 max-w-[220px] flex-[1.3]"
          />
        </MetricCell>
      </div>
    </div>
  );
}
