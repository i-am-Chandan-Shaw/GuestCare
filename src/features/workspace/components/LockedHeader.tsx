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
  onClearAll,
}: {
  phase: WorkspacePhase;
  customer: Customer | null;
  property?: Property | null;
  issue?: Issue | null;
  onClearCustomer: () => void;
  onClearProperty: () => void;
  onClearIssue: () => void;
  onClearAll: () => void;
}) {
  return (
    <div className="shrink-0 border-b border-border-color bg-white px-5 py-2.5">
      <h1 className="text-[15px] font-black uppercase tracking-tight text-text-primary">
        Incidents
      </h1>

      <div className="mt-2">
        <WorkspaceSelectorRow
          phase={phase}
          customer={customer}
          property={property ?? null}
          issue={issue ?? null}
          onClearCustomer={onClearCustomer}
          onClearProperty={onClearProperty}
          onClearIssue={onClearIssue}
          onClearAll={onClearAll}
        />
      </div>
    </div>
  );
}
