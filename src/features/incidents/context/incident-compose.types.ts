import type { FormState } from "@/features/incidents/components/incident-form.types";
import type { IncidentPanelMode } from "@/features/incidents/lib/incident-window-sync";

export interface IncidentComposeState {
  form: FormState;
  panelMode: IncidentPanelMode;
  pipWindow: Window | null;
}

export interface IncidentComposeActions {
  setForm: (form: FormState) => void;
  clearForm: () => void;
  openIncidentPanel: (mode?: Exclude<IncidentPanelMode, "closed">) => void;
  closeIncidentPanel: () => void;
  minimizeIncidentPanel: () => void;
  expandIncidentPanel: () => void;
  detachIncidentPanel: () => void;
  attachIncidentPanel: () => void;
  submitIncident: () => void;
}

export interface IncidentComposeMeta {
  isPopupWindow: boolean;
  isSubmitting: boolean;
  isIncidentFormDirty: boolean;
  isDetached: boolean;
}

export interface IncidentComposeContextValue {
  state: IncidentComposeState;
  actions: IncidentComposeActions;
  meta: IncidentComposeMeta;
}
