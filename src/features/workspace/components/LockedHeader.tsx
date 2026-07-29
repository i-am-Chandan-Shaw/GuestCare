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

  if (showSelector) {
    return (
      <div className="shrink-0 border-b border-border-color bg-white/80 px-5 py-3 backdrop-blur-xl">
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
    );
  }

  return (
    <div className="shrink-0 border-b border-border-color bg-white/80 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <WorkspaceSelectorRow
          phase={phase}
          customer={customer}
          property={property ?? null}
          issue={issue ?? null}
          onClearCustomer={onClearCustomer}
          onClearProperty={onClearProperty}
          onClearIssue={onClearIssue}
        />
        {customer && (
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
