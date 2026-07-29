import { Hash, MessageSquare } from "lucide-react";
import { useMemo } from "react";
import { StatusChip } from "@/components/ui/StatusChip";
import { getAgentHandle } from "@/shared/lib/agent-display";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Customer, Issue, Property } from "@/shared/types";
import type { FormState } from "./incident-form.types";

export function IncidentPreview({
  form,
  customer,
  property,
  issue,
}: {
  form: FormState;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
}) {
  const { agent } = useAuth();
  const timestamp = useMemo(
    () =>
      new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [],
  );

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border-color shadow-sm">
      <div className="flex items-center justify-between border-b border-border-color bg-app-bg/50 px-4 py-3">
        <div className="flex items-center gap-2.5 text-[14px] font-semibold text-text-primary">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-primary/10 text-brand-primary">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          Slack Preview
        </div>
        <StatusChip tone="success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Live
        </StatusChip>
      </div>

      <div className="bg-card-bg p-4">
        <div className="flex items-start gap-3">
          <img
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            alt="Agent"
            className="mt-1 h-8 w-8 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[13.5px] text-text-primary mb-2">
              <Hash className="h-4 w-4 text-text-muted" />
              guest-issues
            </div>
            <div className="space-y-0.5 text-[13px] leading-relaxed text-text-primary">
              <div>
                <span className="font-semibold">Customer:</span> {customer?.name || "—"}
              </div>
              <div>
                <span className="font-semibold">Guest:</span> {form.callerName || "—"} (
                {form.callerContact || "—"})
              </div>
              <div>
                <span className="font-semibold">Booking name:</span> {form.nameOnBooking || "—"}
              </div>
              <div>
                <span className="font-semibold">Reservation:</span> {form.reservation || "N/A"}
              </div>
              <div>
                <span className="font-semibold">Property:</span> {property?.name ?? "—"}
              </div>
              <div>
                <span className="font-semibold">Type:</span> {form.incidentType}
              </div>
              <div>
                <span className="font-semibold">Issue:</span>{" "}
                {form.issueSummary || issue?.name || "—"}{" "}
                <span className="text-warning font-medium">({form.priority})</span>
              </div>
              <div>
                <span className="font-semibold">Status:</span> {form.status}
              </div>
              {form.actions.length > 0 && (
                <div>
                  <span className="font-semibold">Actions:</span> {form.actions.join(", ")}
                </div>
              )}
              <div>
                <span className="font-semibold">Notes:</span> {form.callNotes || "—"}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11.5px] font-medium text-text-secondary">
              <img
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="Priya"
                className="h-4 w-4 rounded-full"
              />
              {timestamp} · {agent.name} ({getAgentHandle(agent)})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
