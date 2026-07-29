import { PictureInPicture2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IncidentForm } from "@/features/incidents/components/IncidentForm";
import { useIncidentCompose } from "@/features/incidents/context/IncidentComposeProvider";
import { formatIncidentTitle } from "@/features/incidents/lib/format-incident-title";
import { useWorkspaceContext } from "@/features/workspace/context/WorkspaceProvider";

function HeaderIconButton({
  label,
  onClick,
  active = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        active
          ? "bg-brand-primary/15 text-brand-primary hover:bg-brand-primary/20"
          : "text-muted-foreground hover:bg-surface hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

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
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-surface-2/80 px-3 py-1.5">
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
          {title}
          <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            PiP
          </span>
        </p>

        <div className="flex shrink-0 items-center gap-0.5">
          <HeaderIconButton
            label="Return to app"
            onClick={actions.attachIncidentPanel}
            active
          >
            <PictureInPicture2 className="h-4 w-4" strokeWidth={1.75} />
          </HeaderIconButton>

          <HeaderIconButton label="Close" onClick={handleClose}>
            <X className="h-4 w-4" />
          </HeaderIconButton>
        </div>
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
