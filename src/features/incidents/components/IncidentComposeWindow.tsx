import { Maximize2, Minus, PictureInPicture2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DiscardDraftBanner } from "@/features/incidents/components/DiscardDraftBanner";
import { HeaderIconButton } from "@/features/incidents/components/HeaderIconButton";
import { IncidentForm } from "@/features/incidents/components/IncidentForm";
import { isDocumentPipSupported } from "@/features/incidents/lib/incident-pip";
import type { IncidentPanelMode } from "@/features/incidents/lib/incident-window-sync";
import { formatIncidentTitle } from "@/features/incidents/lib/format-incident-title";
import type { Customer, Issue, Property } from "@/shared/types";
import type { FormState } from "@/features/incidents/components/incident-form.types";

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

  return (
    <div
      className={cn(
        "fixed bottom-0 right-6 z-[9999] flex flex-col overflow-hidden border border-border bg-surface shadow-[0_-4px_24px_rgba(15,23,42,0.12)]",
        isMinimized
          ? "w-[min(360px,calc(100vw-3rem))] rounded-t-lg"
          : "h-[min(640px,85vh)] w-[min(480px,calc(100vw-3rem))] rounded-t-lg",
      )}
      role="dialog"
      aria-label="Report compose"
    >
      <header
        className={cn(
          "flex shrink-0 items-center gap-2 bg-surface-2/80 px-3 py-1.5",
          !isMinimized && "border-b border-border",
          isMinimized && "cursor-pointer transition-colors hover:bg-surface-2",
        )}
        onClick={isMinimized ? onExpand : undefined}
        onKeyDown={
          isMinimized
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onExpand();
                }
              }
            : undefined
        }
        role={isMinimized ? "button" : undefined}
        tabIndex={isMinimized ? 0 : undefined}
        aria-label={isMinimized ? `Expand report compose: ${title}` : undefined}
      >
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
          {title}
        </p>

        <div
          className="flex shrink-0 items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
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

      {confirmDiscard ? (
        <DiscardDraftBanner
          onKeep={() => setConfirmDiscard(false)}
          onDiscard={() => {
            setConfirmDiscard(false);
            onRequestClose();
          }}
        />
      ) : null}

      {!isMinimized ? (
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
      ) : null}
    </div>
  );
}
