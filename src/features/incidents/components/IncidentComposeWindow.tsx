import { Maximize2, Minus, Pin, X } from "lucide-react";
import { useState } from "react";
import { IncidentForm } from "@/features/incidents/components/IncidentForm";
import { isDocumentPipSupported } from "@/features/incidents/lib/incident-pip";
import type { IncidentPanelMode } from "@/features/incidents/lib/incident-window-sync";
import { formatIncidentTitle } from "@/features/incidents/lib/format-incident-title";
import type { Customer, Issue, Property } from "@/shared/types";
import type { FormState } from "@/features/incidents/components/incident-form.types";

function HeaderIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
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
  const pinLabel = isDocumentPipSupported()
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
      className={
        isMinimized
          ? "fixed bottom-6 right-6 z-[9999] flex h-12 w-[min(360px,calc(100vw-3rem))] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-[0_8px_32px_rgba(15,23,42,0.18)]"
          : "fixed bottom-6 right-6 z-[9999] flex h-[min(640px,85vh)] w-[min(480px,calc(100vw-3rem))] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-[0_8px_32px_rgba(15,23,42,0.18)]"
      }
      role="dialog"
      aria-label="Incident compose"
    >
      <header className="flex shrink-0 items-center gap-0.5 border-b border-border bg-surface-2/80 px-2 py-1.5">
        <HeaderIconButton
          label={isMinimized ? "Expand" : "Minimize"}
          onClick={isMinimized ? onExpand : onMinimize}
        >
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
        </HeaderIconButton>

        <HeaderIconButton label={pinLabel} onClick={onDetach}>
          <Pin className="h-4 w-4" strokeWidth={1.75} />
        </HeaderIconButton>

        <p className="min-w-0 flex-1 truncate px-2 text-[13px] font-semibold text-foreground">
          {title}
        </p>

        <HeaderIconButton label="Close" onClick={handleClose}>
          <X className="h-4 w-4" />
        </HeaderIconButton>
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
