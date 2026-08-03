import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { Avatar } from "@/shared/components/Avatar";
import {
  PORTFOLIO_CARD_TITLE_CLASS,
  PortfolioMetricColumn,
} from "@/shared/components/PortfolioCardParts";
import { cn } from "@/lib/utils";
import type { CustomerSummary } from "@/shared/types";
import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, ChevronRight, ClipboardList, Clock } from "lucide-react";

function MetricCell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-stretch border-l border-border-color pl-4 first:border-l-0 first:pl-0">
      {children}
    </div>
  );
}

function formatLastIssueAgo(timestamp: string): string {
  return formatRelativeTime(timestamp).replace(
    /\b(day|days|hour|hours|week|weeks|min)\b/gi,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

export function CustomerPortfolioCard({
  customer,
  onSelect,
  striped = false,
}: {
  customer: CustomerSummary;
  onSelect: () => void;
  striped?: boolean;
}) {
  const lastIssue = customer.lastIssue;
  const lastIssueTitle = lastIssue
    ? lastIssue.propertyLabel
      ? `${lastIssue.summary} — ${lastIssue.propertyLabel}`
      : lastIssue.summary
    : "—";
  const lastIssueAgo = lastIssue ? formatLastIssueAgo(lastIssue.timestamp) : null;

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
        striped
          ? "bg-grid-header-bg/40 hover:bg-grid-header-bg/60"
          : "hover:bg-app-bg",
      )}
    >
      <div className="flex min-w-0 w-[240px] shrink-0 items-center gap-3 border-r border-border-color pr-4">
        <Avatar
          name={customer.name}
          seed={customer.id}
          src={customer.imageUrl}
          size="lg"
        />
        <div className="min-w-0">
          <h3 className={cn(PORTFOLIO_CARD_TITLE_CLASS, "min-w-0 truncate text-[14px]")}>
            {customer.name}
          </h3>
          <p className="mt-0.5 truncate text-[12px] font-medium text-card-subtext">
            {customer.email}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-stretch pl-4">
        <MetricCell>
          <PortfolioMetricColumn
            icon={<AlertCircle strokeWidth={1.75} />}
            label="Open Reports"
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
            icon={<ClipboardList strokeWidth={1.75} />}
            label="Total Reports"
            value={customer.totalIssuesCount}
          />
        </MetricCell>
        <MetricCell>
          <PortfolioMetricColumn
            icon={<Clock strokeWidth={1.75} />}
            label="Last Report"
            labelAccessory={
              lastIssueAgo ? (
                <span className="inline-flex h-3.5 shrink-0 items-center rounded border border-warning/20 bg-warning/10 px-1 text-[9px] font-semibold leading-none text-warning">
                  {lastIssueAgo}
                </span>
              ) : null
            }
            value={
              <span className="block truncate text-[12px] font-semibold">{lastIssueTitle}</span>
            }
            className="min-w-0 max-w-[220px] flex-[1.2]"
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
