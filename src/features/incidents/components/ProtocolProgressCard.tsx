import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceContext } from "@/features/workspace/context/WorkspaceProvider";
import type { Issue } from "@/shared/types";

type StepStatus = "completed" | "in_progress" | "not_required";

function statusLabel(status: StepStatus): string {
  if (status === "completed") return "Completed";
  if (status === "not_required") return "Not required";
  return "In progress";
}

function ProtocolStepChip({
  label,
  status,
  className,
}: {
  label: string;
  status: StepStatus;
  className?: string;
}) {
  const complete = status === "completed";
  const muted = status === "not_required";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-lg border px-3 py-2",
        complete && "border-success/25 bg-success/8",
        status === "in_progress" && "border-warning/30 bg-warning/8",
        muted && "border-border-color bg-app-bg",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          complete && "bg-success/15 text-success",
          status === "in_progress" && "bg-warning/15 text-warning",
          muted && "bg-border-color/60 text-text-muted",
        )}
      >
        {complete ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
        ) : (
          <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
        )}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[13px] font-semibold text-text-primary">{label}</p>
        <p
          className={cn(
            "text-[12px] font-medium",
            complete && "text-success",
            status === "in_progress" && "text-warning",
            muted && "text-text-muted",
          )}
        >
          {statusLabel(status)}
        </p>
      </div>
    </div>
  );
}

function ProtocolConnector({ tone }: { tone: "success" | "warning" }) {
  return (
    <div className="flex w-4 shrink-0 items-center self-center" aria-hidden>
      <div
        className={cn(
          "h-0 w-full border-t-2 border-dotted",
          tone === "success" ? "border-success/70" : "border-warning/70",
        )}
      />
    </div>
  );
}

function ProtocolProgressRow({
  verificationStatus,
  troubleshootingStatus,
}: {
  verificationStatus: StepStatus;
  troubleshootingStatus: StepStatus;
}) {
  const connectorTone =
    verificationStatus === "completed" ? "success" : "warning";

  return (
    <div className="flex w-full min-w-0 items-stretch">
      <ProtocolStepChip
        className="min-w-0 flex-1"
        label="Verification"
        status={verificationStatus}
      />
      <ProtocolConnector tone={connectorTone} />
      <ProtocolStepChip
        className="min-w-0 flex-1"
        label="Troubleshooting steps"
        status={troubleshootingStatus}
      />
    </div>
  );
}

export function ProtocolProgressCard({ issue }: { issue: Issue | null }) {
  const { state } = useWorkspaceContext();
  const { checked, verificationChecked } = state.checklist;

  if (!issue) {
    return (
      <ProtocolProgressRow
        verificationStatus="in_progress"
        troubleshootingStatus="in_progress"
      />
    );
  }

  const verificationRequired = issue.reservationVerification !== "Not Required";
  const verificationComplete =
    !verificationRequired ||
    (issue.verification.length > 0 &&
      issue.verification.every((_, i) => verificationChecked[`v${i}`]));

  const troubleshootingComplete =
    issue.steps.length > 0 && issue.steps.every((step) => checked[step.id]);

  const verificationStatus: StepStatus = !verificationRequired
    ? "not_required"
    : verificationComplete
      ? "completed"
      : "in_progress";

  const troubleshootingStatus: StepStatus = troubleshootingComplete
    ? "completed"
    : "in_progress";

  return (
    <ProtocolProgressRow
      verificationStatus={verificationStatus}
      troubleshootingStatus={troubleshootingStatus}
    />
  );
}
