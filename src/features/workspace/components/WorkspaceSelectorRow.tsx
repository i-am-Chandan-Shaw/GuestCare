import { Building2, ClipboardList, User } from "lucide-react";
import {
  WorkspaceStep,
  WorkspaceStepSeparator,
  type WorkspaceStepState,
} from "@/features/workspace/components/WorkspaceStep";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import type { Customer, Issue, Property } from "@/shared/types";

function resolveStepStates(
  phase: WorkspacePhase,
  customer: Customer | null,
  property: Property | null,
  issue: Issue | null,
): { customer: WorkspaceStepState; property: WorkspaceStepState; issue: WorkspaceStepState } {
  if (issue || phase === "protocol") {
    return { customer: "completed", property: "completed", issue: "completed" };
  }
  if (property || phase === "property") {
    return { customer: "completed", property: "completed", issue: "current" };
  }
  if (customer || phase === "customer") {
    return { customer: "completed", property: "current", issue: "incomplete" };
  }
  return { customer: "current", property: "incomplete", issue: "incomplete" };
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
  const states = resolveStepStates(phase, customer, property, issue);

  return (
    <nav
      className="flex w-full min-w-0 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2"
      aria-label="Workspace steps"
    >
      <div className="flex min-w-0 flex-1 basis-0 justify-start overflow-hidden">
        <WorkspaceStep
          stepNumber={1}
          label="Customer"
          value={customer?.name}
          icon={<User strokeWidth={1.75} />}
          state={states.customer}
          onClear={states.customer === "completed" ? onClearCustomer : undefined}
        />
      </div>

      <WorkspaceStepSeparator />

      <div className="flex min-w-0 flex-1 basis-0 justify-center overflow-hidden">
        <WorkspaceStep
          stepNumber={2}
          label="Property"
          value={property?.name}
          icon={<Building2 strokeWidth={1.75} />}
          state={states.property}
          onClear={states.property === "completed" ? onClearProperty : undefined}
        />
      </div>

      <WorkspaceStepSeparator />

      <div className="flex min-w-0 flex-1 basis-0 justify-center overflow-hidden">
        <WorkspaceStep
          stepNumber={3}
          label="Issue"
          value={issue?.name}
          icon={<ClipboardList strokeWidth={1.75} />}
          state={states.issue}
          onClear={states.issue === "completed" ? onClearIssue : undefined}
        />
      </div>
    </nav>
  );
}
