import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCustomerById } from "@/features/directory/api/customers.api";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import type { DirectoryCustomer } from "@/features/directory/lib/map-customer-row";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

function Field({ label, value }: { label: string; value?: string | null }) {
  const text = value?.trim();
  if (!text) return null;
  return (
    <div className="space-y-1">
      <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">{label}</h3>
      <p className="whitespace-pre-wrap text-[13px] text-text-primary">{text}</p>
    </div>
  );
}

export function CustomerViewDialog({
  open,
  customerId,
  onOpenChange,
  onEdit,
}: {
  open: boolean;
  customerId: string | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (customerId: string) => void;
}) {
  const [customer, setCustomer] = useState<DirectoryCustomer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customerId) {
      setCustomer(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void getCustomerById(customerId)
      .then((next) => {
        if (!cancelled) setCustomer(next);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getClientErrorMessage(error, "Failed to load customer."));
        onOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, customerId, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="space-y-0 border-b border-border-color px-6 py-5 text-left">
          <DialogTitle className="text-[18px] font-bold tracking-tight text-text-primary">
            {customer?.name ?? "Customer"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-[13px] text-text-secondary">
            {loading
              ? "Loading…"
              : customer
                ? [customer.email, customer.phone].filter(Boolean).join(" · ") || "Customer details"
                : "Customer details"}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-5 overflow-y-auto px-6 py-5">
          {loading || !customer ? (
            <p className="py-8 text-center text-[13px] text-text-muted">Loading customer…</p>
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" value={customer.email} />
                <Field label="Phone" value={customer.phone} />
              </section>

              <section className="space-y-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  PMS
                </h3>
                {customer.pms.url || customer.pms.username || customer.pms.password ? (
                  <div className="space-y-3">
                    <Field label="Link" value={customer.pms.url} />
                    <Field label="Username" value={customer.pms.username} />
                    <Field
                      label="Password"
                      value={customer.pms.password ? "••••••••" : undefined}
                    />
                  </div>
                ) : (
                  <p className="text-[13px] text-text-muted">No PMS details.</p>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  Contacts
                </h3>
                {customer.contacts.length === 0 ? (
                  <p className="text-[13px] text-text-muted">No contacts.</p>
                ) : (
                  <ul className="space-y-3">
                    {customer.contacts.map((contact) => (
                      <li key={contact.id} className="text-[13px] text-text-primary">
                        <p className="font-medium">
                          {[contact.label, contact.name].filter((part) => part.trim()).join(" · ") ||
                            "Contact"}
                        </p>
                        {contact.phone.trim() ? (
                          <p className="mt-0.5 text-text-secondary">{contact.phone}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  Guest verification
                </h3>
                {customer.guestVerificationSteps.length === 0 ? (
                  <p className="text-[13px] text-text-muted">No verification steps.</p>
                ) : (
                  <ol className="space-y-3">
                    {customer.guestVerificationSteps.map((step, index) => (
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
            </>
          )}
        </div>

        <DialogFooter className="gap-3 border-t border-border-color px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {customer && onEdit ? (
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(customer.id);
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
