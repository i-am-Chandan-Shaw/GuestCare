import { AlertTriangle, ArrowUpRight, Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/ui/UiKit";
import { verificationId } from "@/features/workspace/lib/verification-id";
import type { Issue } from "@/shared/types";

export function IssueProtocolTab({
  issue,
  checked,
  onToggle,
  verificationChecked,
  onToggleVerification,
  collapsed,
  toggleCollapsed,
  stepExpanded,
  setStepExpanded,
  outcome,
  setOutcome,
  onOutcomeSelected,
}: {
  issue: Issue;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  verificationChecked: Record<string, boolean>;
  onToggleVerification: (id: string) => void;
  collapsed: Record<string, boolean>;
  toggleCollapsed: (key: string) => void;
  stepExpanded: Record<string, boolean>;
  setStepExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  outcome: "resolve" | "escalate" | null;
  setOutcome: (o: "resolve" | "escalate") => void;
  onOutcomeSelected?: (o: "resolve" | "escalate") => void;
}) {
  const firstUncheckedIdx = issue.steps.findIndex((s) => !checked[s.id]);
  const activeStepIdx = firstUncheckedIdx === -1 ? issue.steps.length : firstUncheckedIdx;
  const verificationRequired = issue.reservationVerification === "Required";
  const verificationOptional = issue.reservationVerification === "Required on Escalated";
  const verificationDone = issue.verification.filter(
    (text, i) => verificationChecked[verificationId(issue.id, i, text)],
  ).length;

  return (
    <>
      {issue.verification.length > 0 ? (
        <CollapsibleCard
          title="Verification"
          badge={
            verificationRequired || verificationOptional
              ? `${verificationDone} / ${issue.verification.length} checks`
              : undefined
          }
          open={!collapsed.verify}
          onToggle={() => toggleCollapsed("verify")}
        >
          {verificationOptional && (
            <p className="text-[12px] text-muted-foreground mb-3">
              Required when escalating if guest cannot wait.
            </p>
          )}
          <ul className="space-y-3.5">
            {issue.verification.map((v, i) => {
              const id = verificationId(issue.id, i, v);
              const done = !!verificationChecked[id];
              return (
                <li key={id}>
                  <button
                    onClick={() => onToggleVerification(id)}
                    className="cursor-pointer flex items-center gap-3 text-[13.5px] text-foreground font-medium text-left w-full"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full shadow-sm border",
                        done
                          ? "bg-success text-white border-success"
                          : "bg-white border-border text-transparent",
                      )}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {v}
                  </button>
                </li>
              );
            })}
          </ul>
        </CollapsibleCard>
      ) : null}

      {issue.steps.length > 0 ? (
        <CollapsibleCard
          title="Troubleshooting Steps"
          badge={`${issue.steps.filter((s) => checked[s.id]).length} / ${issue.steps.length} done`}
          open={!collapsed.proto}
          onToggle={() => toggleCollapsed("proto")}
        >
          <ul className="relative flex flex-col">
            {issue.steps.map((step, idx) => {
              const isCompleted = checked[step.id];
              const isCurrent = idx === activeStepIdx;
              const bodyOpen =
                stepExpanded[step.id] !== undefined ? stepExpanded[step.id] : isCurrent;
              const hasBody = Boolean(step.hint);
              return (
                <li
                  key={step.id}
                  className={cn(
                    "relative mb-2 flex items-start justify-between gap-4 rounded-sm border p-4 transition-all",
                    isCurrent
                      ? "border-brand-primary/20 bg-brand-primary/8"
                      : "border-transparent bg-card-bg",
                  )}
                >
                  {idx < issue.steps.length - 1 && (
                    <span className="absolute bottom-[-38px] left-[30px] top-[30px] z-10 w-[1.5px] -translate-x-1/2 bg-border/80" />
                  )}
                  <div className="relative z-20 flex min-w-0 flex-1 items-start gap-3.5">
                    <div
                      className={cn(
                        "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[13px] font-semibold transition-all",
                        isCurrent
                          ? "btn-primary-gradient border-transparent text-white"
                          : isCompleted
                            ? "border-success bg-success text-white"
                            : "border-border-strong bg-white text-muted-foreground",
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : idx + 1}
                    </div>
                    <div className="mt-[3px] flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "flex-1 text-[14px] font-bold",
                            isCurrent
                              ? "text-primary"
                              : isCompleted
                                ? "text-foreground line-through opacity-70"
                                : "text-foreground",
                          )}
                        >
                          {step.label}
                        </span>
                        {hasBody ? (
                          <button
                            type="button"
                            onClick={() =>
                              setStepExpanded((prev) => ({
                                ...prev,
                                [step.id]: !bodyOpen,
                              }))
                            }
                            className="cursor-pointer shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                            aria-label={bodyOpen ? "Collapse step details" : "Expand step details"}
                          >
                            {bodyOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        ) : null}
                      </div>
                      {hasBody && bodyOpen ? (
                        <p
                          className={cn(
                            "mt-2 whitespace-pre-wrap text-[13px] leading-relaxed",
                            isCurrent ? "text-primary/80" : "text-muted-foreground",
                          )}
                        >
                          {step.hint}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="z-10 shrink-0">
                    {isCurrent ? (
                      <button
                        type="button"
                        onClick={() => onToggle(step.id)}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-primary/15 bg-brand-primary/10 px-3.5 py-2 text-[12px] font-bold text-brand-primary shadow-sm transition-colors hover:bg-brand-primary/15"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3} /> Done{" "}
                        <ArrowUpRight className="h-3.5 w-3.5 rotate-45" />
                      </button>
                    ) : isCompleted ? (
                      <button
                        type="button"
                        onClick={() => onToggle(step.id)}
                        className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-3.5 py-2 text-[12px] font-bold text-muted-foreground shadow-sm transition-colors hover:bg-surface-2"
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggle(step.id)}
                        className="flex cursor-pointer items-center gap-1 rounded-md border border-border bg-white px-3.5 py-2 text-[12px] font-bold text-foreground shadow-sm transition-colors hover:bg-surface-2"
                      >
                        Mark Done <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <OutcomeActions
            outcome={outcome}
            setOutcome={setOutcome}
            onOutcomeSelected={onOutcomeSelected}
            className="mt-4 border-t border-border/60 pt-4"
          />
        </CollapsibleCard>
      ) : (
        <OutcomeActions
          outcome={outcome}
          setOutcome={setOutcome}
          onOutcomeSelected={onOutcomeSelected}
        />
      )}
    </>
  );
}

function OutcomeActions({
  outcome,
  setOutcome,
  onOutcomeSelected,
  className,
}: {
  outcome: "resolve" | "escalate" | null;
  setOutcome: (o: "resolve" | "escalate") => void;
  onOutcomeSelected?: (o: "resolve" | "escalate") => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <button
        type="button"
        onClick={() => {
          setOutcome("resolve");
          onOutcomeSelected?.("resolve");
        }}
        className={cn(
          "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-success/20 bg-success/10 px-4 py-2.5 text-[13px] font-bold text-success shadow-sm transition-colors hover:bg-success/15",
          outcome === "resolve" && "ring-2 ring-success/40",
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
        Yes, resolved
      </button>
      <button
        type="button"
        onClick={() => {
          setOutcome("escalate");
          onOutcomeSelected?.("escalate");
        }}
        className={cn(
          "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-danger/20 bg-danger/10 px-4 py-2.5 text-[13px] font-bold text-danger shadow-sm transition-colors hover:bg-danger/15",
          outcome === "escalate" && "ring-2 ring-danger/40",
        )}
      >
        <AlertTriangle className="h-4 w-4" strokeWidth={3} />
        No, escalate
      </button>
    </div>
  );
}

function CollapsibleCard({
  title,
  badge,
  children,
  open,
  onToggle,
}: {
  title: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <SectionCard
      padded={false}
      className="shadow-sm border border-border rounded-sm"
      title={
        <button className="flex w-full items-center gap-2.5 text-left" onClick={onToggle}>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-foreground transition-transform",
              !open && "-rotate-90",
            )}
          />
          <span className="text-[14.5px] font-bold text-foreground">{title}</span>
          {badge && (
            <span className="ml-auto text-[12px] font-medium text-muted-foreground">{badge}</span>
          )}
        </button>
      }
    >
      {open && <div className="p-4">{children}</div>}
    </SectionCard>
  );
}
