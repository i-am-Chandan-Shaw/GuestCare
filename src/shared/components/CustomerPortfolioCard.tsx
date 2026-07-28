import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
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
import type { ReactNode } from "react";

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

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
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-[18px] font-semibold leading-none tracking-tight text-foreground/90">{value}</div>
      </div>
    </div>
  );
}

function IconActionButton({
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground/80"
    >
      {children}
    </button>
  );
}

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
  const lastActivity = lastIssue ? formatRelativeTime(lastIssue.timestamp) : null;

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
      className="group w-full cursor-pointer rounded-md border border-border/60 bg-card text-left transition-colors hover:bg-muted/10"
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/85 text-[13px] font-semibold text-white">
          {initialsFromName(customer.name)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground/90">{customer.name}</h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {customer.email} · {customer.phone}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {lastActivity && (
            <span className="text-[13px] text-muted-foreground">{lastActivity}</span>
          )}
          <div className="flex items-center gap-2">
            <IconActionButton label="Create report" onClick={handleCreateReport}>
              <FilePlus2 className="h-4 w-4" strokeWidth={1.75} />
            </IconActionButton>
            <IconActionButton label="View customer" onClick={handleSelect}>
              <User className="h-4 w-4" strokeWidth={1.75} />
            </IconActionButton>
          </div>
        </div>
      </div>

      <div className="flex items-center px-5 pb-4 pt-0">
        <MetricColumn
          icon={<Building2 className="h-4 w-4 text-primary/80" strokeWidth={1.75} />}
          iconClassName="bg-primary/8"
          label="Properties"
          value={customer.propertyCount}
        />

        <div className="h-10 w-px shrink-0 bg-border/50" aria-hidden />

        <MetricColumn
          icon={<ClipboardList className="h-4 w-4 text-primary/80" strokeWidth={1.75} />}
          iconClassName="bg-primary/8"
          label="Total Issues"
          value={customer.totalIssuesCount}
        />

        <div className="h-10 w-px shrink-0 bg-border/50" aria-hidden />

        <MetricColumn
          icon={<AlertCircle className="h-4 w-4 text-warning/80" strokeWidth={1.75} />}
          iconClassName="bg-warning/10"
          label="Open Issues"
          value={customer.openReportsCount}
        />

        <div className="h-10 w-px shrink-0 bg-border/50" aria-hidden />

        <MetricColumn
          icon={<CheckCircle2 className="h-4 w-4 text-success/80" strokeWidth={1.75} />}
          iconClassName="bg-success/10"
          label="Resolved"
          value={customer.resolvedCount}
        />

        <div className="h-10 w-px shrink-0 bg-border/50" aria-hidden />

        <MetricColumn
          icon={<Clock className="h-4 w-4 text-[#7C3AED]/80" strokeWidth={1.75} />}
          iconClassName="bg-[#7C3AED]/8"
          label="Last Issue"
          value={
            <span className="block truncate text-[14px] font-semibold leading-snug">{lastIssueTitle}</span>
          }
          className="min-w-[200px] flex-[1.4]"
        />
      </div>
    </article>
  );
}
