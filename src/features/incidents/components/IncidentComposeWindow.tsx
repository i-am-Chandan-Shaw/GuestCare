import { cn } from "@/lib/utils";
import { Maximize2, Minus, PictureInPicture2, X } from "lucide-react";
import { useState } from "react";
import { IncidentForm } from "@/features/copilot/components/IncidentForm";
import type { ComposeMode } from "@/features/workspace/context/WorkspaceProvider";
import type { Customer, Issue, Property } from "@/shared/types";
import type { FormState } from "@/features/copilot/components/incident-form.types";

function composeTitle(customer: Customer | null, property: Property | null) {
  if (customer && property) return `${customer.name} · ${property.name}`;
  if (customer) return customer.name;
  return "New incident";
}

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
      className={cn(
        "rounded-md p-1.5 transition-colors",
        active
          ? "bg-primary/15 text-primary"
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
  isFormDirty,
  isSubmitting,
  onMinimize,
  onTogglePip,
  onExpand,
  onRequestClose,
}: {
  mode: Exclude<ComposeMode, "closed">;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  form: FormState;
  setForm: (f: FormState) => void;
  onClear: () => void;
  onSubmit: () => void;
  isFormDirty: boolean;
  isSubmitting: boolean;
  onMinimize: () => void;
  onTogglePip: () => void;
  onExpand: () => void;
  onRequestClose: () => void;
}) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const title = composeTitle(customer, property);
  const isMinimized = mode === "minimized";
  const isPip = mode === "pip";

  const handleClose = () => {
    if (isFormDirty) {
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
        "fixed z-[9999] flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-[0_8px_32px_rgba(15,23,42,0.18)] transition-[width,height]",
        isMinimized
          ? "bottom-6 right-6 h-12 w-[min(360px,calc(100vw-3rem))]"
          : isPip
            ? "bottom-6 right-6 h-[280px] w-[340px]"
            : "bottom-6 right-6 h-[min(640px,85vh)] w-[min(480px,calc(100vw-3rem))]",
      )}
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

        <HeaderIconButton
          label={isPip ? "Exit compact mode" : "Compact mode (PiP)"}
          onClick={onTogglePip}
          active={isPip}
        >
          <PictureInPicture2 className="h-4 w-4" strokeWidth={isPip ? 2.25 : 1.75} />
        </HeaderIconButton>

        <p className="min-w-0 flex-1 truncate px-2 text-[13px] font-semibold text-foreground">
          {title}
          {isPip && (
            <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              PiP
            </span>
          )}
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
            compact={isPip}
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
