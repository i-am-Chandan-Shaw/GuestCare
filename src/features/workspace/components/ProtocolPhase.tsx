import { IssuePanel, PropertyPanel } from "@/features/copilot/components";
import {
  useProtocolChecklist,
  useWorkspaceSelection,
} from "@/features/workspace/hooks/useWorkspace";
import type { Issue } from "@/shared/types";

export function ProtocolPhase({
  onPickIssue,
  onBack,
}: {
  onPickIssue?: (issue: Issue) => void;
  onBack?: () => void;
}) {
  const { customer, property, issue, selectIssue } = useWorkspaceSelection();
  const { checked, verificationChecked, outcome, setOutcome, toggleStep, toggleVerification } =
    useProtocolChecklist();

  if (!property) return null;

  return (
    <main className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)]">
      <div className="min-h-0 border-r border-border bg-surface/60">
        <PropertyPanel property={property} contacts={customer?.contacts ?? []} />
      </div>
      <div className="min-h-0 bg-background">
        <IssuePanel
          issue={issue}
          property={property}
          customerId={customer?.id}
          contacts={customer?.contacts ?? []}
          onPick={(next) => (onPickIssue ?? selectIssue)(next)}
          onBack={onBack}
          checked={checked}
          onToggle={toggleStep}
          verificationChecked={verificationChecked}
          onToggleVerification={toggleVerification}
          outcome={outcome}
          setOutcome={setOutcome}
        />
      </div>
    </main>
  );
}
