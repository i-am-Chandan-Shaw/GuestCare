import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCustomerById } from "@/features/directory/api/customers.api";
import { getProtocolById } from "@/features/directory/api/protocols.api";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import type { DirectoryProtocol } from "@/features/directory/lib/map-protocol-row";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { CustomerContact } from "@/shared/types";

function formatEscalation(
  protocol: DirectoryProtocol,
  contacts: CustomerContact[],
): string {
  if (protocol.customerContactId) {
    const contact = contacts.find((item) => item.id === protocol.customerContactId);
    if (!contact) return "Customer contact";
    const parts = [contact.label, contact.name, contact.phone].filter((part) => part.trim());
    return parts.join(" · ") || "Customer contact";
  }

  if (protocol.escalationKind === "custom") {
    return protocol.escalationDetails?.trim() || "Custom";
  }
  if (protocol.escalationKind === "emergency-then-host") {
    return "Call emergency services then host";
  }
  if (protocol.escalationKind === "host") return "Call Host";
  if (protocol.escalationKind === "next-day-followup") return "Next-day follow-up";
  if (protocol.escalationKind === "cleaning") return "Cleaning";
  return "—";
}

export function ProtocolViewDialog({
  open,
  protocolId,
  customerId,
  onOpenChange,
  onEdit,
}: {
  open: boolean;
  protocolId: string | null;
  customerId: string;
  onOpenChange: (open: boolean) => void;
  onEdit?: (protocolId: string) => void;
}) {
  const [protocol, setProtocol] = useState<DirectoryProtocol | null>(null);
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !protocolId) {
      setProtocol(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void Promise.all([getProtocolById(protocolId), getCustomerById(customerId)])
      .then(([nextProtocol, customer]) => {
        if (cancelled) return;
        setProtocol(nextProtocol);
        setContacts(customer.contacts);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getClientErrorMessage(error, "Failed to load protocol."));
        onOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, protocolId, customerId, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="space-y-0 border-b border-border-color px-6 py-5 text-left">
          <DialogTitle className="text-[18px] font-bold tracking-tight text-text-primary">
            {protocol?.name ?? "Protocol"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-[13px] text-text-secondary">
            {loading
              ? "Loading…"
              : protocol
                ? `${protocol.category} · ${protocol.priority} · ${protocol.reservationVerification}`
                : "Protocol details"}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-5 overflow-y-auto px-6 py-5">
          {loading || !protocol ? (
            <p className="py-8 text-center text-[13px] text-text-muted">Loading protocol…</p>
          ) : (
            <>
              <section className="space-y-1">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  Priority category
                </h3>
                <p className="text-[13px] text-text-primary">{protocol.priorityCategory}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  Troubleshooting
                </h3>
                {protocol.steps.length === 0 ? (
                  <p className="text-[13px] text-text-muted">No steps.</p>
                ) : (
                  <ol className="space-y-3">
                    {protocol.steps.map((step, index) => (
                      <li key={step.id} className="text-[13px] text-text-primary">
                        <p className="font-medium">
                          {index + 1}. {step.label}
                        </p>
                        {step.hint ? (
                          <p className="mt-1 whitespace-pre-wrap text-text-secondary">{step.hint}</p>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="space-y-1">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  Escalation
                </h3>
                <p className="text-[13px] text-text-primary">
                  {formatEscalation(protocol, contacts)}
                </p>
              </section>
            </>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-3 border-t border-border-color px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {protocol && onEdit ? (
            <Button
              type="button"
              size="lg"
              onClick={() => {
                onOpenChange(false);
                onEdit(protocol.id);
              }}
            >
              Edit
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
