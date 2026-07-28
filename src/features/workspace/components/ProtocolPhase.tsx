import { IncidentDrawer, IssuePanel, PropertyPanel } from "@/features/copilot/components";
import type { WorkspaceState } from "@/features/workspace/hooks/useWorkspace";
import type { Issue } from "@/shared/types";

export function ProtocolPhase({
  workspace,
  issueSearch = "",
  onPickIssue,
}: {
  workspace: WorkspaceState;
  issueSearch?: string;
  onPickIssue?: (issue: Issue) => void;
}) {
  const {
    customer,
    property,
    issue,
    checked,
    verificationChecked,
    outcome,
    drawerOpen,
    form,
    setForm,
    setOutcome,
    setDrawerOpen,
    toggleStep,
    toggleVerification,
    selectIssue,
    clearForm,
    submitIncident,
  } = workspace;

  if (!property) return null;

  return (
    <>
      <main className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)]">
        <div className="min-h-0 border-r border-border bg-surface/60">
          <PropertyPanel property={property} />
        </div>
        <div className="min-h-0 bg-background">
          <IssuePanel
            issue={issue}
            property={property}
            issueSearch={issueSearch}
            onPick={(next) => (onPickIssue ?? selectIssue)(next)}
            checked={checked}
            onToggle={toggleStep}
            verificationChecked={verificationChecked}
            onToggleVerification={toggleVerification}
            outcome={outcome}
            setOutcome={setOutcome}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
        </div>
      </main>

      <IncidentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        form={form}
        setForm={setForm}
        onClear={clearForm}
        onSubmit={submitIncident}
        customer={customer}
        property={property}
        issue={issue}
      />
    </>
  );
}
