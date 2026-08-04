import { PictureInPicture2, X } from "lucide-react";
import { useState } from "react";
import { DiscardDraftBanner } from "@/features/incidents/components/DiscardDraftBanner";
import { HeaderIconButton } from "@/features/incidents/components/HeaderIconButton";
import { IncidentForm } from "@/features/incidents/components/IncidentForm";
import { useIncidentCompose } from "@/features/incidents/context/IncidentComposeProvider";
import { formatIncidentTitle } from "@/features/incidents/lib/format-incident-title";
import { useWorkspaceContext } from "@/features/workspace/context/WorkspaceProvider";

export function IncidentComposePopupPage() {
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
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-surface-2/80 px-3 py-1.5">
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
          {title}
          <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            PiP
          </span>
        </p>

        <div className="flex shrink-0 items-center gap-0.5">
          <HeaderIconButton label="Return to app" onClick={actions.attachIncidentPanel} active>
            <PictureInPicture2 className="h-4 w-4" strokeWidth={1.75} />
          </HeaderIconButton>

          <HeaderIconButton label="Close" onClick={handleClose}>
            <X className="h-4 w-4" />
          </HeaderIconButton>
        </div>
      </header>

      {confirmDiscard ? (
        <DiscardDraftBanner
          onKeep={() => setConfirmDiscard(false)}
          onDiscard={() => {
            setConfirmDiscard(false);
            actions.closeIncidentPanel();
          }}
        />
      ) : null}

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
