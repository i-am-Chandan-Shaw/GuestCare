import { cn } from "@/lib/utils";
import { priorityMeta } from "@/shared/constants/agent";
import { PORTFOLIO_CARD_TITLE_CLASS } from "@/shared/components/PortfolioCardParts";
import type { IncidentLog } from "@/shared/types";
import { Building2, Clock, User } from "lucide-react";

function DataField({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-start gap-2", className)}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-card-subtext/70" strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-card-subtext">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-card-text">{value}</p>
      </div>
    </div>
  );
}

export function ReportRow({ log }: { log: IncidentLog }) {
  const isResolved = log.status === "Resolved";
  const priorityLabel = log.priority ? priorityMeta[log.priority].label : null;

  return (
    <article className="flex w-full gap-4 rounded-sm border border-border/60 bg-card px-4 py-3 text-left">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-[11px] font-semibold uppercase",
          isResolved ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
        )}
      >
        {isResolved ? "Done" : "Open"}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className={cn("truncate", PORTFOLIO_CARD_TITLE_CLASS)}>
              {log.issueSummary}
            </h3>
            <p className="mt-0.5 truncate text-[12px] text-card-subtext">
              {log.incidentType} · {log.status}
            </p>
          </div>
          {priorityLabel && (
            <span className="shrink-0 text-[12px] text-card-subtext">{priorityLabel}</span>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-x-8 gap-y-2 md:flex-nowrap md:justify-between md:gap-x-4">
          <DataField
            icon={Building2}
            label="Property"
            value={log.propertyLabel}
            className="md:flex-1"
          />
          <DataField icon={User} label="Agent" value={log.agent} className="md:flex-1" />
          <DataField icon={User} label="Caller" value={log.callerName} className="md:flex-1" />
          <DataField
            icon={Clock}
            label="Logged"
            value={log.timestamp}
            className="md:min-w-0 md:flex-[1.2]"
          />
        </div>
      </div>
    </article>
  );
}
