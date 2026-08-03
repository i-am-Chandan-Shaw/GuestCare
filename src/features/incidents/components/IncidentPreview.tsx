import { Check, ChevronDown, ChevronUp, Copy, Hash, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { getAgentHandle } from "@/shared/lib/agent-display";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Customer, Issue, Property } from "@/shared/types";
import type { FormState } from "./incident-form.types";

function buildSlackMessage({
  form,
  customer,
  property,
  issue,
  agentLabel,
  timestamp,
}: {
  form: FormState;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  agentLabel: string;
  timestamp: string;
}): string {
  const issueLine = `${form.issueSummary || issue?.name || "—"} (${form.priority})`;
  return [
    "#guest-issues",
    `Customer: ${customer?.name || "—"}`,
    `Guest: ${form.callerName || "—"} (${form.callerContact || "—"})`,
    `Booking name: ${form.nameOnBooking || "—"}`,
    `Reservation: ${form.reservation || "N/A"}`,
    `Property: ${property?.name ?? "—"}`,
    `Type: ${form.incidentType}`,
    `Issue: ${issueLine}`,
    `Status: ${form.status}`,
    `Notes: ${form.callNotes || "—"}`,
    `${timestamp} · ${agentLabel}`,
  ].join("\n");
}

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
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const agentLabel = `${agent.name} (${getAgentHandle(agent)})`;
  const message = useMemo(
    () =>
      buildSlackMessage({
        form,
        customer,
        property,
        issue,
        agentLabel,
        timestamp,
      }),
    [form, customer, property, issue, agentLabel, timestamp],
  );

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border-color shadow-sm">
      <div
        className={cn(
          "flex items-center justify-between bg-app-bg/50 px-4 py-3",
          expanded && "border-b border-border-color",
        )}
      >
        <div className="flex items-center gap-2.5 text-[14px] font-semibold text-text-primary">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-primary/10 text-brand-primary">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          Slack Preview
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyMessage}
            aria-label="Copy Slack message"
            title="Copy message"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-app-bg hover:text-text-primary"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={2} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-primary transition-colors hover:text-brand-secondary"
            aria-expanded={expanded}
          >
            {expanded ? "Hide preview" : "Show preview"}
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="bg-card-bg p-4">
          <div className="flex items-start gap-3">
            <img
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              alt="Agent"
              className="mt-1 h-8 w-8 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="mb-2 flex items-center gap-1.5 font-semibold text-[13.5px] text-text-primary">
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
                  <span className="font-medium text-warning">({form.priority})</span>
                </div>
                <div>
                  <span className="font-semibold">Status:</span> {form.status}
                </div>
                <div>
                  <span className="font-semibold">Notes:</span> {form.callNotes || "—"}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11.5px] font-medium text-text-secondary">
                <img
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  alt=""
                  className="h-4 w-4 rounded-full"
                />
                {timestamp} · {agentLabel}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
