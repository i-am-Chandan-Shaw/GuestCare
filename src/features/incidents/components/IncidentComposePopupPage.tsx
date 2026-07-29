import { PinOff, X } from "lucide-react";
import { useState } from "react";
import { IncidentForm } from "@/features/incidents/components/IncidentForm";
import { useIncidentCompose } from "@/features/incidents/context/IncidentComposeProvider";
import { formatIncidentTitle } from "@/features/incidents/lib/format-incident-title";
import { useWorkspaceContext } from "@/features/workspace/context/WorkspaceProvider";

export function IncidentComposePopupPage({ alwaysOnTop = false }: { alwaysOnTop?: boolean }) {
  const { state: workspaceState } = useWorkspaceContext();
  const { customer, property, issue } = workspaceState.selection;
  const { state, actions, meta } = useIncidentCompose();

  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const title = formatIncidentTitle(customer, property);

  const handleClose = () => {
    if (meta.isIncidentFormDirty) {
      setConfirmDiscard(true);
      return;
    }
    actions.closeIncidentPanel();
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center gap-1 border-b border-border bg-surface-2/80 px-3 py-2">
        <button
          type="button"
          onClick={actions.attachIncidentPanel}
          title="Return to app"
          aria-label="Return to app"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1.5 text-[12px] font-semibold text-primary hover:bg-primary/15"
        >
          <PinOff className="h-3.5 w-3.5" />
          Return to app
        </button>
        <p className="min-w-0 flex-1 truncate px-2 text-[13px] font-semibold text-foreground">
          {title}
          <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {alwaysOnTop ? "On top" : "Pinned"}
          </span>
        </p>
        <button
          type="button"
          onClick={handleClose}
          title="Close"
          aria-label="Close"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {confirmDiscard && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-warning/10 px-3 py-2 text-[12px]">
          <span className="text-foreground">Discard draft?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDiscard(false)}
              className="rounded border border-border px-2 py-0.5 font-medium hover:bg-surface"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDiscard(false);
                actions.closeIncidentPanel();
              }}
              className="rounded bg-destructive px-2 py-0.5 font-medium text-destructive-foreground"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-hidden">
        <IncidentForm
          embedded
          form={state.form}
          setForm={actions.setForm}
          onClear={actions.clearForm}
          onSubmit={actions.submitIncident}
          customer={customer}
          property={property}
          issue={issue}
          isSubmitting={meta.isSubmitting}
        />
      </div>
    </div>
  );
}
