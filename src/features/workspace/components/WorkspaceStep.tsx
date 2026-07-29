import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

export type WorkspaceStepState = "incomplete" | "current" | "completed";

const STEPPER = {
  active: "#2D5BFF",
  activeBg: "#E8F0FE",
  complete: "#1D7143",
  incomplete: "#8C91A0",
} as const;

export function WorkspaceStep({
  stepNumber,
  label,
  value,
  icon,
  state,
  onClear,
}: {
  stepNumber: 1 | 2 | 3;
  label: "Select customer" | "Select property" | "Select issue";
  value?: string | null;
  icon: ReactNode;
  state: WorkspaceStepState;
  onClear?: () => void;
}) {
  const stepLabel = String(stepNumber);
  const isCompleted = state === "completed";
  const isCurrent = state === "current";
  const displayLabel = isCompleted && value ? value : label;

  const color =
    state === "completed"
      ? STEPPER.complete
      : state === "current"
        ? STEPPER.active
        : STEPPER.incomplete;

  return (
    <div
      className="inline-flex h-6 min-w-0 max-w-full items-center gap-2"
      aria-current={isCurrent ? "step" : undefined}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums leading-none",
          state === "incomplete" && "border border-[#8C91A0] bg-white text-[#8C91A0]",
        )}
        style={
          isCompleted
            ? { backgroundColor: STEPPER.complete, color: "#FFFFFF" }
            : isCurrent
              ? { backgroundColor: STEPPER.activeBg, color: STEPPER.active }
              : undefined
        }
        aria-hidden
      >
        {isCompleted ? (
          <Check className="h-[10px] w-[10px]" strokeWidth={2.5} absoluteStrokeWidth />
        ) : (
          stepLabel
        )}
      </span>

      <span className="inline-flex h-5 shrink-0 items-center [&>svg]:h-3.5 [&>svg]:w-3.5" style={{ color }}>
        {icon}
      </span>

      <span
        className="min-w-0 truncate text-[12px] font-semibold leading-none"
        style={{ color }}
        title={displayLabel}
      >
        {displayLabel}
      </span>

      {isCompleted && onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label={`Clear ${label}`}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-black/5"
          style={{ color: STEPPER.complete }}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      ) : null}
    </div>
  );
}

export function WorkspaceStepSeparator() {
  return (
    <div
      className="flex h-6 w-6 min-w-0 max-w-10 shrink grow-0 basis-6 items-center justify-center gap-0.5 overflow-hidden px-1"
      aria-hidden
    >
      <span className="h-1 w-1 shrink-0 rounded-full bg-[#C5CAD3]" />
      <span className="h-1 w-1 shrink-0 rounded-full bg-[#C5CAD3]" />
      <span className="h-1 w-1 shrink-0 rounded-full bg-[#C5CAD3]" />
    </div>
  );
}
