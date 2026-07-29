import { Maximize2, Minus, PictureInPicture2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IncidentForm } from "@/features/incidents/components/IncidentForm";
import { isDocumentPipSupported } from "@/features/incidents/lib/incident-pip";
import type { IncidentPanelMode } from "@/features/incidents/lib/incident-window-sync";
import { formatIncidentTitle } from "@/features/incidents/lib/format-incident-title";
import type { Customer, Issue, Property } from "@/shared/types";
import type { FormState } from "@/features/incidents/components/incident-form.types";

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

export function IncidentComposeWindow({
  mode,
  customer,
  property,
  issue,
  form,
  setForm,
  onClear,
  onSubmit,
  isIncidentFormDirty,
  isSubmitting,
  onMinimize,
  onDetach,
  onExpand,
  onRequestClose,
}: {
  mode: Exclude<IncidentPanelMode, "closed" | "detached">;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  form: FormState;
  setForm: (f: FormState) => void;
  onClear: () => void;
  onSubmit: () => void;
  isIncidentFormDirty: boolean;
  isSubmitting: boolean;
  onMinimize: () => void;
  onDetach: () => void;
  onExpand: () => void;
  onRequestClose: () => void;
}) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const title = formatIncidentTitle(customer, property);
  const isMinimized = mode === "minimized";
  const pipLabel = isDocumentPipSupported()
    ? "Keep on top while browsing"
    : "Open in separate window";

  const handleClose = () => {
    if (isIncidentFormDirty) {
      setConfirmDiscard(true);
      return;
    }
    onRequestClose();
  };

  const confirmClose = () => {
    setConfirmDiscard(false);
    onRequestClose();
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 right-6 z-[9999] flex flex-col overflow-hidden border border-border bg-surface shadow-[0_-4px_24px_rgba(15,23,42,0.12)]",
        isMinimized
          ? "w-[min(360px,calc(100vw-3rem))] rounded-t-lg"
          : "h-[min(640px,85vh)] w-[min(480px,calc(100vw-3rem))] rounded-t-lg",
      )}
      role="dialog"
      aria-label="Incident compose"
    >
      <header
        className={cn(
          "flex shrink-0 items-center gap-2 bg-surface-2/80 px-3 py-1.5",
          !isMinimized && "border-b border-border",
        )}
      >
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
          {title}
        </p>

        <div className="flex shrink-0 items-center gap-0.5">
          <HeaderIconButton
            label={isMinimized ? "Expand" : "Minimize"}
            onClick={isMinimized ? onExpand : onMinimize}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </HeaderIconButton>

          <HeaderIconButton label={pipLabel} onClick={onDetach}>
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
              onClick={confirmClose}
              className="rounded bg-destructive px-2 py-0.5 font-medium text-destructive-foreground"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {!isMinimized && (
        <div className="min-h-0 flex-1 overflow-hidden">
          <IncidentForm
            embedded
            form={form}
            setForm={setForm}
            onClear={onClear}
            onSubmit={onSubmit}
            customer={customer}
            property={property}
            issue={issue}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}
