import { Building2, ChevronRight, ClipboardList, User } from "lucide-react";
import {
  WORKSPACE_FIELD_WIDTH,
  WorkspaceSelectionChip,
} from "@/features/workspace/components/WorkspaceSelectionChip";
import { WorkspaceSearchBar } from "@/features/workspace/components/WorkspaceSearchBar";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import type { Customer, Issue, Property } from "@/shared/types";

function FlowSeparator({ active = false }: { active?: boolean }) {
  return (
    <ChevronRight
      className={active ? "h-4 w-4 shrink-0 text-card-subtext" : "h-4 w-4 shrink-0 text-muted-foreground/35"}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

export function WorkspaceSelectorRow({
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
  property: Property | null;
  issue: Issue | null;
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
  const showCustomerSearch = phase === "browse" && !customer;
  const showPropertySearch = phase === "customer" && customer && !property;
  const showIssueSearch = phase === "property" && property && !issue;
  const propertyStepActive = Boolean(customer);
  const issueStepActive = Boolean(customer && property);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {customer ? (
        <WorkspaceSelectionChip
          label={customer.name}
          onClear={onClearCustomer}
          icon={<User className="h-4 w-4" />}
          className={WORKSPACE_FIELD_WIDTH}
        />
      ) : (
        <WorkspaceSearchBar
          value={customerSearch}
          onChange={onCustomerSearchChange}
          placeholder="Search customers…"
          icon={<User className="h-4 w-4" />}
          className={WORKSPACE_FIELD_WIDTH}
        />
      )}

      <FlowSeparator active={propertyStepActive} />

      {property ? (
        <WorkspaceSelectionChip
          label={property.name}
          onClear={onClearProperty}
          icon={<Building2 className="h-4 w-4" />}
          className={WORKSPACE_FIELD_WIDTH}
        />
      ) : (
        <WorkspaceSearchBar
          value={propertySearch}
          onChange={onPropertySearchChange}
          placeholder="Search properties…"
          icon={<Building2 className="h-4 w-4" />}
          disabled={!showPropertySearch}
          className={WORKSPACE_FIELD_WIDTH}
        />
      )}

      <FlowSeparator active={issueStepActive} />

      {issue ? (
        <WorkspaceSelectionChip
          label={issue.name}
          onClear={onClearIssue}
          icon={<ClipboardList className="h-4 w-4" />}
          className={WORKSPACE_FIELD_WIDTH}
        />
      ) : (
        <WorkspaceSearchBar
          value={issueSearch}
          onChange={onIssueSearchChange}
          placeholder="Search issues…"
          icon={<ClipboardList className="h-4 w-4" />}
          disabled={!showIssueSearch}
          className={WORKSPACE_FIELD_WIDTH}
        />
      )}
    </div>
  );
}
