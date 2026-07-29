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
  const showReportsLink = phase === "protocol" && customer;

  return (
    <div className="shrink-0 border-b border-border-color bg-white px-5 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="shrink-0 text-[15px] font-black uppercase tracking-tight text-text-primary">
          Incidents
        </h1>
        {showReportsLink && (
          <Link
            to="/reports"
            search={{ customerId: customer.id }}
            className="shrink-0 rounded-md border border-border-color bg-card-bg px-2 py-0.5 text-[11px] font-semibold text-brand-primary hover:bg-app-bg"
          >
            View reports
          </Link>
        )}
      </div>

      <div className="mt-2">
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
    </div>
  );
}
