import { Link } from "@tanstack/react-router";
import { WorkspaceSelectorRow } from "@/features/workspace/components/WorkspaceSelectorRow";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import type { Customer, Issue, Property } from "@/shared/types";

export function LockedHeader({
  phase,
  customer,
  property,
  issue,
  customerSearch,
  onCustomerSearchChange,
  propertySearch,
  onPropertySearchChange,
  issueSearch,
  onIssueSearchChange,
  onClearCustomer,
  onClearProperty,
  onClearIssue,
}: {
  phase: WorkspacePhase;
  customer: Customer | null;
  property?: Property | null;
  issue?: Issue | null;
  customerSearch: string;
  onCustomerSearchChange: (value: string) => void;
  propertySearch: string;
  onPropertySearchChange: (value: string) => void;
  issueSearch: string;
  onIssueSearchChange: (value: string) => void;
  onClearCustomer: () => void;
  onClearProperty: () => void;
  onClearIssue: () => void;
}) {
  const showSelector = phase !== "protocol";

  if (showSelector) {
    return (
      <div className="shrink-0  bg-surface/80 px-5 py-3">
        <WorkspaceSelectorRow
          phase={phase}
          customer={customer}
          property={property ?? null}
          issue={issue ?? null}
          customerSearch={customerSearch}
          onCustomerSearchChange={onCustomerSearchChange}
          propertySearch={propertySearch}
          onPropertySearchChange={onPropertySearchChange}
          issueSearch={issueSearch}
          onIssueSearchChange={onIssueSearchChange}
          onClearCustomer={onClearCustomer}
          onClearProperty={onClearProperty}
          onClearIssue={onClearIssue}
        />
      </div>
    );
  }

  return (
    <div className="shrink-0   bg-surface/80 px-5 py-3">
      <div className="flex items-center justify-between gap-3">
        <WorkspaceSelectorRow
          phase={phase}
          customer={customer}
          property={property ?? null}
          issue={issue ?? null}
          customerSearch=""
          onCustomerSearchChange={() => {}}
          propertySearch=""
          onPropertySearchChange={() => {}}
          issueSearch=""
          onIssueSearchChange={() => {}}
          onClearCustomer={onClearCustomer}
          onClearProperty={onClearProperty}
          onClearIssue={onClearIssue}
        />
        {customer && (
          <Link
            to="/reports"
            search={{ customerId: customer.id }}
            className="shrink-0 rounded-sm border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold text-primary hover:bg-surface-2"
          >
            View reports
          </Link>
        )}
      </div>
    </div>
  );
}
