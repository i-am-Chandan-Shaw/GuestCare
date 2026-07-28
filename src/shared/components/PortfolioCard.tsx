import { cn } from "@/lib/utils";
import { PORTFOLIO_CARD_TITLE_CLASS } from "@/shared/components/PortfolioCardParts";
import {
  AlertCircle,
  Building2,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";
import type { ReactNode } from "react";

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function StatCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-card-subtext">
        {icon}
        {label}
      </div>
      <span className="truncate text-[13px] font-medium text-card-text">{value}</span>
    </div>
  );
}

export function PortfolioCard({
  title,
  subtitle,
  propertyCount,
  openCount,
  lastIssue,
  address,
  badge,
  onClick,
}: {
  title: string;
  subtitle?: string;
  propertyCount?: number;
  openCount?: number;
  lastIssue?: string;
  address?: string;
  badge?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group flex w-full gap-4 rounded-lg border border-border/80 bg-card p-4 text-left shadow-sm transition-all",
        onClick && "cursor-pointer hover:border-primary/35 hover:shadow-md hover:-translate-y-px",
      )}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-[15px] font-bold text-white shadow-sm"
        style={{ background: "linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)" }}
      >
        {initialsFromName(title)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className={PORTFOLIO_CARD_TITLE_CLASS}>{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-[12.5px] text-card-subtext">{subtitle}</p>
            )}
            {address && (
              <p className="mt-1 flex items-center gap-1 text-[12px] text-card-subtext">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{address}</span>
              </p>
            )}
          </div>
          {onClick && (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-primary">
            {badge ?? "Portfolio"}
          </span>
          {openCount !== undefined && openCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-warning/15 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-warning">
              {openCount} open
            </span>
          )}
        </div>

        {(propertyCount !== undefined || lastIssue) && (
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/60 pt-3">
            {propertyCount !== undefined && (
              <StatCell
                icon={<Building2 className="h-3 w-3" />}
                label="Properties"
                value={String(propertyCount)}
              />
            )}
            {openCount !== undefined && (
              <StatCell
                icon={<AlertCircle className="h-3 w-3" />}
                label="Open"
                value={String(openCount)}
              />
            )}
            {lastIssue && (
              <StatCell
                icon={<Clock className="h-3 w-3" />}
                label="Last issue"
                value={lastIssue}
              />
            )}
          </div>
        )}
      </div>
    </Comp>
  );
}
