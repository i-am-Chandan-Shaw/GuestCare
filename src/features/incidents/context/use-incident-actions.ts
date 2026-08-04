import { useCallback } from "react";
import { toast } from "sonner";
import { type FormState } from "@/features/incidents/components/incident-form.types";
import { getIncidentFormBaseline } from "@/features/incidents/lib/incident-form-baseline";
import {
  openIncidentPipWindow,
  watchIncidentPipClosed,
} from "@/features/incidents/lib/incident-pip";
import {
  openIncidentPopupWindow,
  watchIncidentPopupClosed,
  type IncidentPanelMode,
  type IncidentWindowState,
  type IncidentWindowSync,
} from "@/features/incidents/lib/incident-window-sync";
import type { Customer, Issue, Property } from "@/shared/types";
import type { CreateIncidentInput } from "@/features/incidents/api/incidents.api";
import type { WorkspaceActions } from "@/features/workspace/context/workspace-actions";

export function useIncidentActions({
  form,
  setFormState,
  panelMode,
  setPanelMode,
  pipWindowRef,
  setPipWindow,
  popupRef,
  isPopupWindow,
  customer,
  property,
  issue,
  syncRef,
  workspaceActions,
  broadcastPatch,
  broadcastFull,
  formBroadcastTimer,
  createIncidentMutate,
  closeDetachedWindow,
}: {
  form: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  panelMode: IncidentPanelMode;
  setPanelMode: React.Dispatch<React.SetStateAction<IncidentPanelMode>>;
  pipWindowRef: React.MutableRefObject<Window | null>;
  setPipWindow: React.Dispatch<React.SetStateAction<Window | null>>;
  popupRef: React.MutableRefObject<Window | null>;
  isPopupWindow: boolean;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  syncRef: React.MutableRefObject<IncidentWindowSync | null>;
  workspaceActions: WorkspaceActions;
  broadcastPatch: (patch: Partial<IncidentWindowState>) => void;
  broadcastFull: (overrides?: Partial<IncidentWindowState>) => void;
  formBroadcastTimer: React.MutableRefObject<number | null>;
  createIncidentMutate: (data: CreateIncidentInput) => void;
  closeDetachedWindow: () => void;
}) {
  const setForm = useCallback(
    (next: FormState) => {
      setFormState(next);
      if (formBroadcastTimer.current) window.clearTimeout(formBroadcastTimer.current);
      formBroadcastTimer.current = window.setTimeout(() => {
        broadcastPatch({ form: next });
      }, 120);
    },
    [setFormState, broadcastPatch, formBroadcastTimer],
  );

  const attachIncidentPanel = useCallback(() => {
    closeDetachedWindow();
    setPanelMode("expanded");
    syncRef.current.post({ type: "ATTACH" });
    broadcastFull({ panelMode: "expanded", detached: false });
  }, [broadcastFull, closeDetachedWindow, syncRef, setPanelMode]);

  const detachIncidentPanel = useCallback(() => {
    if (panelMode === "detached") {
      attachIncidentPanel();
      return;
    }

    void (async () => {
      try {
        const pip = await openIncidentPipWindow();
        pipWindowRef.current = pip;
        setPipWindow(pip);
        setPanelMode("detached");

        watchIncidentPipClosed(pip, () => {
          pipWindowRef.current = null;
          setPipWindow(null);
          if (isPopupWindow) return;
          setPanelMode((mode) => (mode === "detached" ? "expanded" : mode));
        });
        return;
      } catch {
        // Fall back to popup when PiP is unavailable.
      }

      const popup = openIncidentPopupWindow();
      if (!popup) return;

      popupRef.current = popup;
      setPanelMode("detached");
      syncRef.current.post({ type: "DETACH" });
      broadcastFull({ panelMode: "detached", detached: true });

      watchIncidentPopupClosed(popup, () => {
        popupRef.current = null;
        if (isPopupWindow) return;
        setPanelMode("expanded");
        syncRef.current.post({ type: "ATTACH" });
      });
    })();
  }, [
    attachIncidentPanel,
    broadcastFull,
    isPopupWindow,
    panelMode,
    syncRef,
    pipWindowRef,
    setPipWindow,
    setPanelMode,
    popupRef,
  ]);

  const clearForm = useCallback(() => {
    workspaceActions.resetChecklist();
    const nextForm = getIncidentFormBaseline(issue);
    setFormState(nextForm);
    broadcastPatch({
      form: nextForm,
      checked: {},
      verificationChecked: {},
      outcome: null,
    });
  }, [broadcastPatch, issue, setFormState, workspaceActions]);

  const openIncidentPanel = useCallback(
    (mode: Exclude<IncidentPanelMode, "closed"> = "expanded") => {
      setPanelMode(mode);
      broadcastPatch({ panelMode: mode, detached: mode === "detached" });
    },
    [broadcastPatch, setPanelMode],
  );

  const closeIncidentPanel = useCallback(() => {
    if (panelMode === "detached" && !isPopupWindow) {
      closeDetachedWindow();
    }
    setPanelMode("closed");
    broadcastPatch({ panelMode: "closed", detached: false });
    if (isPopupWindow) {
      window.close();
    }
  }, [broadcastPatch, closeDetachedWindow, isPopupWindow, panelMode, setPanelMode]);

  const minimizeIncidentPanel = useCallback(() => {
    setPanelMode("minimized");
    broadcastPatch({ panelMode: "minimized", detached: false });
  }, [broadcastPatch, setPanelMode]);

  const expandIncidentPanel = useCallback(() => {
    setPanelMode("expanded");
    broadcastPatch({ panelMode: "expanded", detached: false });
  }, [broadcastPatch, setPanelMode]);

  const submitIncident = useCallback(() => {
    const issueSummary = form.issueSummary.trim() || issue?.name?.trim() || "";
    if (!issueSummary) {
      toast.error("Please select or enter what the issue is.");
      return;
    }
    if (!customer?.id) {
      toast.error("Select a customer before logging a report.");
      return;
    }

    createIncidentMutate({
      callerName: form.callerName,
      callerContact: form.callerContact,
      reservation: form.reservation,
      nameOnBooking: form.nameOnBooking,
      incidentType: form.incidentType,
      issueSummary,
      actions: form.actions,
      priority: form.priority,
      status: form.status,
      callNotes: form.callNotes,
      customerId: customer.id,
      propertyId: property?.id,
      propertyLabel: property?.name,
      protocolIssueId: issue?.id,
      agentName: "",
      submittedBy: "",
    });
  }, [createIncidentMutate, form, customer, property, issue]);

  return {
    setForm,
    attachIncidentPanel,
    detachIncidentPanel,
    clearForm,
    openIncidentPanel,
    closeIncidentPanel,
    minimizeIncidentPanel,
    expandIncidentPanel,
    submitIncident,
  };
}
