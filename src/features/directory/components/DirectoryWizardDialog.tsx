import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

export type DirectoryWizardStep = {
  id: string;
  label: string;
};

export function DirectoryWizardDialog({
  open,
  onOpenChange,
  title,
  description,
  mode,
  steps,
  activeIndex,
  onActiveIndexChange,
  canProceed,
  onSubmit,
  submitLabel,
  loading,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  mode: "create" | "edit";
  steps: DirectoryWizardStep[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  canProceed: boolean;
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
  children: ReactNode;
}) {
  const [maxReached, setMaxReached] = useState(0);
  const isLast = activeIndex >= steps.length - 1;

  useEffect(() => {
    if (!open) return;
    setMaxReached(mode === "edit" ? steps.length - 1 : 0);
  }, [open, mode, steps.length]);

  useEffect(() => {
    setMaxReached((prev) => Math.max(prev, activeIndex));
  }, [activeIndex]);

  const selectStep = (index: number) => {
    if (mode === "edit" || index <= maxReached) {
      onActiveIndexChange(index);
    }
  };

  const goBack = () => {
    if (activeIndex > 0) onActiveIndexChange(activeIndex - 1);
  };

  const goNext = () => {
    if (!canProceed || isLast) return;
    const next = activeIndex + 1;
    setMaxReached((prev) => Math.max(prev, next));
    onActiveIndexChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(92vh,820px)] max-h-[min(92vh,820px)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-0 border-b border-border-color px-6 py-5 text-left">
          <DialogTitle className="text-[18px] font-bold tracking-tight text-text-primary">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-[13px] text-text-secondary">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
          <aside className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-border-color bg-app-bg/80 p-3 sm:w-[200px] sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-r sm:p-4">
            {steps.map((step, index) => {
              const active = index === activeIndex;
              const completed = index < activeIndex || (index <= maxReached && index !== activeIndex);
              const unlocked = mode === "edit" || index <= maxReached;
              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => selectStep(index)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-brand-primary text-white"
                      : unlocked
                        ? "text-text-secondary hover:bg-app-bg hover:text-text-primary"
                        : "cursor-not-allowed text-text-muted opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px]",
                      active
                        ? "bg-white/20 text-white"
                        : completed
                          ? "bg-brand-primary/15 text-brand-primary"
                          : "bg-border-color/60 text-text-muted",
                    )}
                  >
                    {completed && !active ? (
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </aside>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        </div>

        <DialogFooter className="shrink-0 flex-row items-center gap-3 border-t border-border-color bg-app-bg/40 px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={goBack}
            disabled={activeIndex === 0 || loading}
            aria-label="Back"
            className="min-w-12 px-3"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Button>

          <div className="flex items-center gap-1.5" aria-label={`Step ${activeIndex + 1} of ${steps.length}`}>
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  index <= activeIndex ? "bg-brand-primary" : "bg-border-color",
                )}
              />
            ))}
          </div>

          {isLast ? (
            <Button
              type="button"
              size="lg"
              onClick={onSubmit}
              loading={loading}
              disabled={!canProceed}
            >
              {submitLabel}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={goNext}
              disabled={!canProceed || loading}
            >
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
