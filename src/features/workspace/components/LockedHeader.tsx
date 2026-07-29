import { Link } from "@tanstack/react-router";
import { WorkspaceSelectorRow } from "@/features/workspace/components/WorkspaceSelectorRow";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import type { Customer, Issue, Property } from "@/shared/types";

export function LockedHeader({
  phase,
  customer,
  property,
  issue,
  onClearCustomer,
  onClearProperty,
  onClearIssue,
}: {
  phase: WorkspacePhase;
  customer: Customer | null;
  property?: Property | null;
  issue?: Issue | null;
  onClearCustomer: () => void;
  onClearProperty: () => void;
  onClearIssue: () => void;
}) {
  const showSelector = phase !== "protocol";

  return (
    <div className="shrink-0 border-b border-border-color bg-white/80 px-5 py-3 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="shrink-0 text-lg font-black uppercase tracking-tight text-text-primary">
            Incidents
          </h1>
          <WorkspaceSelectorRow
            phase={phase}
            customer={customer}
            property={property ?? null}
            issue={issue ?? null}
            onClearCustomer={onClearCustomer}
            onClearProperty={onClearProperty}
            onClearIssue={onClearIssue}
          />
        </div>
        {!showSelector && customer && (
          <Link
            to="/reports"
            search={{ customerId: customer.id }}
            className="shrink-0 rounded-lg border border-border-color bg-card-bg px-2.5 py-1 text-[12px] font-semibold text-brand-primary hover:bg-app-bg"
          >
            View reports
          </Link>
        )}
      </div>
    </div>
  );
}
