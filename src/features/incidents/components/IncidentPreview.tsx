import { Check, ChevronDown, ChevronUp, Copy, Hash, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { buildSlackIncidentMessage } from "@/features/incidents/lib/build-slack-message";
import { cn } from "@/lib/utils";
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
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const message = useMemo(
    () => buildSlackIncidentMessage({ form, customer, property, issue }),
    [form, customer, property, issue],
  );

  const propertyLine = property
    ? [property.name, property.address].filter(Boolean).join(", ")
    : "—";
  const issueSummary = form.issueSummary.trim() || issue?.name?.trim() || "—";

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy to clipboard.");
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
        <div className="space-y-4 bg-card-bg p-4">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="mb-2 flex items-center gap-1.5 font-semibold text-[13.5px] text-text-primary">
              <Hash className="h-4 w-4 text-text-muted" />
              guest-reports
            </div>
            <div className="space-y-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-text-primary">
              <div>
                <span className="font-semibold">Line Called:</span> {customer?.name || "—"}
              </div>
              <div>
                <span className="font-semibold">Inbound for</span> {propertyLine}
              </div>
              <div className="h-2" />
              <div>
                <span className="font-semibold">Incident Type:</span> {form.incidentType || "—"}
              </div>
              <div>
                <span className="font-semibold">What is the Issue?:</span> {issueSummary}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {form.status || "—"}
              </div>
              <div>
                <span className="font-semibold">Priority:</span> {form.priority || "—"}
              </div>
              <div className="h-2" />
              <div>
                <span className="font-semibold">Caller Full Name:</span>{" "}
                {form.callerName || "—"}
              </div>
              <div>
                <span className="font-semibold">Caller Contact:</span>{" "}
                {form.callerContact || "—"}
              </div>
              <div>
                <span className="font-semibold">Reservation #:</span>{" "}
                {form.reservation || "N/A"}
              </div>
              <div className="h-2" />
              <div>
                <span className="font-semibold">Call Notes:</span>
              </div>
              <div className="text-text-primary/90">{form.callNotes.trim() || "—"}</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
