import { cn } from "@/lib/utils";
import { CURRENT_AGENT } from "@/shared/constants/agent";
import { PORTFOLIO_CARD_TITLE_CLASS } from "@/shared/components/PortfolioCardParts";
import type { AgentProfile } from "@/shared/types";
import { Clock, AtSign, Briefcase } from "lucide-react";

function DataField({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Clock;
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

export function AgentRow({ agent }: { agent: AgentProfile }) {
  const isCurrent = agent.id === CURRENT_AGENT.id;

  return (
    <article className="flex w-full gap-4 rounded-sm border border-border/60 bg-card px-4 py-3 text-left">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-muted/60 text-[12px] font-medium text-card-subtext">
        {agent.initials}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={cn("truncate", PORTFOLIO_CARD_TITLE_CLASS)}>{agent.name}</h3>
              {isCurrent && (
                <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase text-primary">
                  You
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-[12px] text-card-subtext">{agent.role}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-x-8 gap-y-2 md:flex-nowrap md:justify-between md:gap-x-4">
          <DataField icon={AtSign} label="Handle" value={agent.handle} className="md:flex-1" />
          <DataField icon={Briefcase} label="Role" value={agent.role} className="md:flex-1" />
          <DataField
            icon={Clock}
            label="Shift"
            value={agent.shift}
            className="md:min-w-0 md:flex-[1.2]"
          />
        </div>
      </div>
    </article>
  );
}
