import { Building2, ClipboardList, Trash2, User } from "lucide-react";
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
  onClearAll,
}: {
  phase: WorkspacePhase;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  onClearAll: () => void;
}) {
  const states = resolveStepStates(phase, customer, property, issue);
  const hasSelection = Boolean(customer || property || issue);

  return (
    <nav className="flex w-full min-w-0 items-center" aria-label="Workspace steps">
      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        <WorkspaceStep
          stepNumber={1}
          label="Customer"
          value={customer?.name}
          icon={<User strokeWidth={1.75} />}
          state={states.customer}
        />

        <WorkspaceStepSeparator />

        <WorkspaceStep
          stepNumber={2}
          label="Property"
          value={property?.name}
          icon={<Building2 strokeWidth={1.75} />}
          state={states.property}
        />

        <WorkspaceStepSeparator />

        <WorkspaceStep
          stepNumber={3}
          label="Issue"
          value={issue?.name}
          icon={<ClipboardList strokeWidth={1.75} />}
          state={states.issue}
        />
      </div>

      {hasSelection ? (
        <>
          <div className="mx-2 h-5 w-px shrink-0 bg-border-color" aria-hidden />
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex shrink-0 items-center gap-1.5 px-1 text-[12px] font-semibold text-danger transition-colors hover:text-danger/80"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Clear all
          </button>
        </>
      ) : null}
    </nav>
  );
}
