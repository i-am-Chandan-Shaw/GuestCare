import { Hash, MessageSquare } from "lucide-react";
import { useMemo } from "react";
import { CURRENT_AGENT } from "@/shared/constants/agent";
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
    <div className="mt-6 rounded-lg border border-border/80 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-surface-2/50 px-4 py-3">
        <div className="flex items-center gap-2.5 font-semibold text-[14px] text-foreground">
          <div className="flex items-center justify-center h-6 w-6 rounded bg-primary/10 text-primary">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          Slack Preview
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-success/10 border border-success/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_0_2px_rgba(34,197,94,0.2)]" />{" "}
          Live
        </span>
      </div>

      <div className="bg-surface p-4">
        <div className="flex items-start gap-3">
          <img
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            alt="Agent"
            className="mt-1 h-8 w-8 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[13.5px] text-foreground mb-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              guest-issues
            </div>
            <div className="text-[13px] leading-relaxed text-foreground space-y-0.5">
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
            <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted-foreground font-medium">
              <img
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="Priya"
                className="h-4 w-4 rounded-full"
              />
              {timestamp} · {CURRENT_AGENT.name} ({CURRENT_AGENT.handle})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
