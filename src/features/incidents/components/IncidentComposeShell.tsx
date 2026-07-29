import { FilePlus2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IncidentComposePopupPage } from "@/features/incidents/components/IncidentComposePopupPage";
import { IncidentComposeWindow } from "@/features/incidents/components/IncidentComposeWindow";
import { useIncidentCompose } from "@/features/incidents/context/IncidentComposeProvider";
import { useWorkspaceContext } from "@/features/workspace/context/WorkspaceProvider";

export function IncidentComposeShell() {
  const [mounted, setMounted] = useState(false);
  const { state: workspaceState } = useWorkspaceContext();
  const { customer, property, issue } = workspaceState.selection;
  const { state, actions, meta } = useIncidentCompose();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || meta.isPopupWindow) {
    return null;
  }

  if (meta.isDetached && !state.pipWindow) {
    return null;
  }

  const portalTarget = state.pipWindow?.document.body ?? document.body;

  return createPortal(
    <>
      {!meta.isDetached && state.panelMode === "closed" && (
        <button
          type="button"
          onClick={() => actions.openIncidentPanel("expanded")}
          aria-label="Create incident report"
          className="fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full btn-primary-gradient text-white shadow-lg shadow-brand-primary/20 transition-transform hover:scale-105 active:scale-95"
          title="Create incident report"
        >
          <FilePlus2 className="h-6 w-6" strokeWidth={2} />
        </button>
      )}

      {!meta.isDetached &&
        (state.panelMode === "expanded" || state.panelMode === "minimized") && (
          <IncidentComposeWindow
            mode={state.panelMode}
            customer={customer}
            property={property}
            issue={issue}
            form={state.form}
            setForm={actions.setForm}
            onClear={actions.clearForm}
            onSubmit={actions.submitIncident}
            isIncidentFormDirty={meta.isIncidentFormDirty}
            isSubmitting={meta.isSubmitting}
            onMinimize={actions.minimizeIncidentPanel}
            onDetach={actions.detachIncidentPanel}
            onExpand={actions.expandIncidentPanel}
            onRequestClose={actions.closeIncidentPanel}
          />
        )}

      {meta.isDetached && state.pipWindow && <IncidentComposePopupPage alwaysOnTop />}
    </>,
    portalTarget,
  );
}
