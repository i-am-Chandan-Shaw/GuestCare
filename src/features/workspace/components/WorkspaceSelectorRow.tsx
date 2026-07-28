import { Building2, ChevronRight, ClipboardList, User } from "lucide-react";
import {
  WORKSPACE_FIELD_WIDTH,
  WorkspaceSelectionChip,
} from "@/features/workspace/components/WorkspaceSelectionChip";
import { WorkspacePlaceholderSlot } from "@/features/workspace/components/WorkspacePlaceholderSlot";
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
  onClearCustomer,
  onClearProperty,
  onClearIssue,
}: {
  phase: WorkspacePhase;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  onClearCustomer: () => void;
  onClearProperty: () => void;
  onClearIssue: () => void;
}) {
  const customerStepActive = phase === "browse" && !customer;
  const propertyStepActive = phase === "customer" && customer && !property;
  const issueStepActive = phase === "property" && property && !issue;
  const propertyFlowActive = Boolean(customer);
  const issueFlowActive = Boolean(customer && property);

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
        <WorkspacePlaceholderSlot
          icon={<User className="h-4 w-4" />}
          label="Customer"
          active={customerStepActive}
        />
      )}

      <FlowSeparator active={propertyFlowActive} />

      {property ? (
        <WorkspaceSelectionChip
          label={property.name}
          onClear={onClearProperty}
          icon={<Building2 className="h-4 w-4" />}
          className={WORKSPACE_FIELD_WIDTH}
        />
      ) : (
        <WorkspacePlaceholderSlot
          icon={<Building2 className="h-4 w-4" />}
          label="Property"
          active={propertyStepActive}
        />
      )}

      <FlowSeparator active={issueFlowActive} />

      {issue ? (
        <WorkspaceSelectionChip
          label={issue.name}
          onClear={onClearIssue}
          icon={<ClipboardList className="h-4 w-4" />}
          className={WORKSPACE_FIELD_WIDTH}
        />
      ) : (
        <WorkspacePlaceholderSlot
          icon={<ClipboardList className="h-4 w-4" />}
          label="Issue"
          active={issueStepActive}
        />
      )}
    </div>
  );
}
