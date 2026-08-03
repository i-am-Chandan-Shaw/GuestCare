import { useWorkspaceContext } from "@/features/workspace/context/WorkspaceProvider";

export type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
export type { IncidentPanelMode } from "@/features/incidents/lib/incident-window-sync";

export function useWorkspaceSelection() {
  const workspace = useWorkspaceContext();
  const { selection } = workspace.state;

  return {
    phase: selection.phase,
    customer: selection.customer,
    property: selection.property,
    issue: selection.issue,
    selectCustomer: workspace.actions.selectCustomer,
    selectProperty: workspace.actions.selectProperty,
    selectIssue: workspace.actions.selectIssue,
    changeCustomer: workspace.actions.changeCustomer,
    changeProperty: workspace.actions.changeProperty,
    changeIssue: workspace.actions.changeIssue,
    hydrateFromSearch: workspace.actions.hydrateFromSearch,
    clearAll: workspace.actions.resetAfterSubmit,
  };
}

export function useProtocolChecklist() {
  const workspace = useWorkspaceContext();
  const { checklist } = workspace.state;

  return {
    checked: checklist.checked,
    verificationChecked: checklist.verificationChecked,
    outcome: checklist.outcome,
    toggleStep: workspace.actions.toggleStep,
    toggleVerification: workspace.actions.toggleVerification,
    setOutcome: workspace.actions.setOutcome,
  };
}
