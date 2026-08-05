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
      {issue.reservationVerification === "Not Required" ? (
        <SectionCard title="Verification" className="shadow-sm border border-border rounded-sm">
          <p className="text-[13px] text-muted-foreground py-1">
            Verification not required for this issue type.
          </p>
        </SectionCard>
      ) : (
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
      )}

      <CollapsibleCard
        title="Troubleshooting Steps"
        badge={`${issue.steps.filter((s) => checked[s.id]).length} / ${issue.steps.length} done`}
        open={!collapsed.proto}
        onToggle={() => toggleCollapsed("proto")}
      >
        <ul className="flex flex-col relative">
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
                  "relative flex items-start justify-between gap-4 p-4 rounded-sm border transition-all mb-2",
                  isCurrent
                    ? "bg-brand-primary/8 border-brand-primary/20"
                    : "bg-card-bg border-transparent",
                )}
              >
                {idx < issue.steps.length - 1 && (
                  <span className="absolute left-[30px] -translate-x-1/2 top-[30px] bottom-[-38px] w-[1.5px] bg-border/80 z-10" />
                )}
                <div className="relative flex items-start gap-3.5 z-20 flex-1 min-w-0">
                  <div
                    className={cn(
                      "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] font-semibold text-[13px] transition-all",
                      isCurrent
                        ? "btn-primary-gradient border-transparent text-white"
                        : isCompleted
                          ? "bg-success border-success text-white"
                          : "bg-white border-border-strong text-muted-foreground",
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : idx + 1}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col mt-[3px]">
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "text-[14px] font-bold flex-1",
                          isCurrent
                            ? "text-primary"
                            : isCompleted
                              ? "text-foreground line-through opacity-70"
                              : "text-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                      {hasBody && (
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
                      )}
                    </div>
                    {hasBody && bodyOpen && (
                      <p
                        className={cn(
                          "mt-2 text-[13px] leading-relaxed whitespace-pre-wrap",
                          isCurrent ? "text-primary/80" : "text-muted-foreground",
                        )}
                      >
                        {step.hint}
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 z-10">
                  {isCurrent ? (
                    <button
                      onClick={() => onToggle(step.id)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-brand-primary/15 bg-brand-primary/10 px-3.5 py-2 text-[12px] font-bold text-brand-primary shadow-sm transition-colors hover:bg-brand-primary/15"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} /> Done{" "}
                      <ArrowUpRight className="h-3.5 w-3.5 rotate-45" />
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={() => onToggle(step.id)}
                      className="cursor-pointer flex items-center gap-1.5 rounded-md border border-border bg-surface px-3.5 py-2 text-[12px] font-bold text-muted-foreground shadow-sm hover:bg-surface-2 transition-colors"
                    >
                      Undo
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggle(step.id)}
                      className="cursor-pointer flex items-center gap-1 rounded-md border border-border bg-white px-3.5 py-2 text-[12px] font-bold text-foreground shadow-sm hover:bg-surface-2 transition-colors"
                    >
                      Mark Done <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex items-center justify-center gap-4 pt-4">
          <button
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
      </CollapsibleCard>
    </>
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
