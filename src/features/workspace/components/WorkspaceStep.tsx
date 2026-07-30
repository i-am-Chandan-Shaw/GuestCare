import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export type WorkspaceStepState = "incomplete" | "current" | "completed";

const STEP_CLIP =
  "polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%)";

export function WorkspaceStep({
  stepNumber,
  label,
  value,
  icon,
  state,
}: {
  stepNumber: 1 | 2 | 3;
  label: "Customer" | "Property" | "Issue";
  value?: string | null;
  icon: ReactNode;
  state: WorkspaceStepState;
}) {
  const isCompleted = state === "completed";
  const isCurrent = state === "current";
  const displayLabel = isCompleted && value ? value : label;

  const fill =
    isCurrent ? "bg-blue-50" : isCompleted ? "bg-emerald-50" : "bg-gray-100";
  const edge =
    isCurrent ? "bg-blue-100" : isCompleted ? "bg-emerald-100" : "bg-gray-200";

  return (
    <div
      className="relative inline-flex h-10 min-w-0 max-w-full"
      aria-current={isCurrent ? "step" : undefined}
    >
      <span
        aria-hidden
        className={cn("absolute inset-0", edge)}
        style={{ clipPath: STEP_CLIP }}
      />
      <span
        aria-hidden
        className={cn("absolute inset-px", fill)}
        style={{ clipPath: STEP_CLIP }}
      />

      <div className="relative z-[1] inline-flex h-10 min-w-0 max-w-full items-center gap-2.5 py-2 pl-3 pr-7">
        <span
          className={cn(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold tabular-nums leading-none",
            isCurrent && "bg-blue-600 text-white",
            isCompleted && "bg-emerald-600 text-white",
            state === "incomplete" && "border border-gray-300 bg-white text-gray-400",
          )}
          aria-hidden
        >
          {isCompleted ? (
            <Check className="h-3 w-3" strokeWidth={2.5} />
          ) : (
            stepNumber
          )}
        </span>

        <span
          className={cn(
            "inline-flex h-4 shrink-0 items-center [&>svg]:h-4 [&>svg]:w-4",
            isCurrent && "text-blue-600",
            isCompleted && "text-emerald-600",
            state === "incomplete" && "text-gray-400",
          )}
          aria-hidden
        >
          {icon}
        </span>

        <span
          className={cn(
            "min-w-0 truncate text-[14px] font-semibold leading-none",
            isCurrent && "text-gray-800",
            isCompleted && "text-gray-800",
            state === "incomplete" && "text-gray-400",
          )}
          title={displayLabel}
        >
          {displayLabel}
        </span>
      </div>
    </div>
  );
}

export function WorkspaceStepSeparator() {
  return (
    <div className="flex h-10 w-7 shrink-0 items-center justify-center" aria-hidden>
      <ChevronRight className="h-4 w-4 text-gray-300" strokeWidth={2} />
    </div>
  );
}
