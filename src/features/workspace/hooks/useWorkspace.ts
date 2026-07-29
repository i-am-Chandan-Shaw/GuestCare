import { useIncidentCompose } from "@/features/incidents/context/IncidentComposeProvider";
import { useWorkspaceContext } from "@/features/workspace/context/WorkspaceProvider";

export type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
export type { IncidentPanelMode } from "@/features/incidents/lib/incident-window-sync";

/** Call workspace facade: selection, checklist, and incident panel actions. */
export function useWorkspace() {
  const workspace = useWorkspaceContext();
  const { state, actions, meta } = useIncidentCompose();
  const { selection, checklist } = workspace.state;

  return {
    phase: selection.phase,
    customer: selection.customer,
    property: selection.property,
    issue: selection.issue,
    checked: checklist.checked,
    verificationChecked: checklist.verificationChecked,
    outcome: checklist.outcome,
    form: state.form,
    panelMode: state.panelMode,
    pipWindow: state.pipWindow,
    isDetached: meta.isDetached,
    isPopupWindow: meta.isPopupWindow,
    isIncidentFormDirty: meta.isIncidentFormDirty,
    isSubmitting: meta.isSubmitting,
    setForm: actions.setForm,
    setOutcome: workspace.actions.setOutcome,
    openIncidentPanel: actions.openIncidentPanel,
    closeIncidentPanel: actions.closeIncidentPanel,
    minimizeIncidentPanel: actions.minimizeIncidentPanel,
    expandIncidentPanel: actions.expandIncidentPanel,
    detachIncidentPanel: actions.detachIncidentPanel,
    attachIncidentPanel: actions.attachIncidentPanel,
    selectCustomer: workspace.actions.selectCustomer,
    selectProperty: workspace.actions.selectProperty,
    selectIssue: workspace.actions.selectIssue,
    changeCustomer: workspace.actions.changeCustomer,
    changeProperty: workspace.actions.changeProperty,
    changeIssue: workspace.actions.changeIssue,
    hydrateFromSearch: workspace.actions.hydrateFromSearch,
    clearAll: workspace.actions.resetAfterSubmit,
    clearForm: actions.clearForm,
    submitIncident: actions.submitIncident,
    toggleStep: workspace.actions.toggleStep,
    toggleVerification: workspace.actions.toggleVerification,
    workspaceState: workspace.state,
    workspaceActions: workspace.actions,
    incidentState: state,
    incidentActions: actions,
    incidentMeta: meta,
  };
}

export type WorkspaceState = ReturnType<typeof useWorkspace>;
