import { FilePlus2 } from "lucide-react";
import { createPortal } from "react-dom";
import { IncidentComposeWindow } from "@/features/incidents/components/IncidentComposeWindow";
import { useWorkspaceContext } from "@/features/workspace/context/WorkspaceProvider";

export function IncidentComposeShell() {
  const workspace = useWorkspaceContext();
  const {
    composeMode,
    customer,
    property,
    issue,
    form,
    setForm,
    clearForm,
    submitIncident,
    isFormDirty,
    isSubmitting,
    openCompose,
    closeCompose,
    minimizeCompose,
    pipCompose,
    expandCompose,
  } = workspace;

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {composeMode === "closed" && (
        <button
          type="button"
          onClick={() => openCompose("expanded")}
          aria-label="Create incident report"
          className="fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(79,99,232,0.45)] transition-transform hover:scale-105 active:scale-95"
          title="Create incident report"
        >
          <FilePlus2 className="h-6 w-6" strokeWidth={2} />
        </button>
      )}

      {composeMode !== "closed" && (
        <IncidentComposeWindow
          mode={composeMode}
          customer={customer}
          property={property}
          issue={issue}
          form={form}
          setForm={setForm}
          onClear={clearForm}
          onSubmit={submitIncident}
          isFormDirty={isFormDirty}
          isSubmitting={isSubmitting}
          onMinimize={minimizeCompose}
          onTogglePip={pipCompose}
          onExpand={expandCompose}
          onRequestClose={closeCompose}
        />
      )}
    </>,
    document.body,
  );
}
