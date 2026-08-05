import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPropertyById } from "@/features/directory/api/properties.api";
import { DirectoryFormSkeleton } from "@/features/directory/components/DirectoryFormSkeleton";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import type { DirectoryProperty } from "@/features/directory/lib/map-property-row";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { SYSTEM_LABELS } from "@/shared/constants/system-labels";
import type { EscalationKind, SystemKey } from "@/shared/types";

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

function formatEscalation(kind: EscalationKind | undefined): string | undefined {
  if (!kind) return undefined;
  if (typeof kind === "object") return kind.custom.trim() || "Custom";
  if (kind === "emergency-then-host") return "Call emergency services then host";
  if (kind === "host") return "Call Host";
  if (kind === "next-day-followup") return "Next-day follow-up";
  if (kind === "cleaning") return "Cleaning";
  return undefined;
}

export function PropertyViewDialog({
  open,
  propertyId,
  onOpenChange,
  onEdit,
}: {
  open: boolean;
  propertyId: string | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (propertyId: string) => void;
}) {
  const [property, setProperty] = useState<DirectoryProperty | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !propertyId) {
      setProperty(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void getPropertyById(propertyId)
      .then((next) => {
        if (!cancelled) setProperty(next);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getClientErrorMessage(error, "Failed to load property."));
        onOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, propertyId, onOpenChange]);

  const systemEntries = property
    ? (Object.entries(property.systems) as [SystemKey, NonNullable<(typeof property.systems)[SystemKey]>][])
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="space-y-0 border-b border-border-color px-6 py-5 text-left">
          <DialogTitle className="text-[18px] font-bold tracking-tight text-text-primary">
            {property?.name ?? "Property"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-[13px] text-text-secondary">
            {loading
              ? "Loading…"
              : property
                ? [
                    property.type,
                    property.maxGuests != null ? `Max ${property.maxGuests} guests` : null,
                    property.address || null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Property details"
                : "Property details"}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-5 overflow-y-auto px-6 py-5">
          {loading || !property ? (
            <DirectoryFormSkeleton rows={6} />
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2">
                <Field label="Building" value={property.buildingNumber} />
                <Field label="Unit" value={property.unit} />
                <Field label="Postal code" value={property.postalCode} />
                <Field label="Area" value={property.area} />
                <Field label="Floor" value={property.floor} />
              </section>

              <Field label="Specific info" value={property.specificInfo} />

              <section className="space-y-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  Stay
                </h3>
                <Field label="Check-in time" value={property.checkIn.time} />
                <Field label="Check-in instructions" value={property.checkIn.instructions} />
                <Field label="Check-out time" value={property.checkOut.time} />
                <Field label="Check-out instructions" value={property.checkOut.instructions} />
                <Field label="Spare keys" value={property.spareKeys} />
                <Field label="Parking" value={property.parking} />
              </section>

              <section className="space-y-3">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  WiFi
                </h3>
                {property.wifi.location || property.wifi.network || property.wifi.password ? (
                  <div className="space-y-3">
                    <Field label="Location" value={property.wifi.location} />
                    <Field label="Network" value={property.wifi.network} />
                    <Field label="Password" value={property.wifi.password} />
                  </div>
                ) : (
                  <p className="text-[13px] text-text-muted">No WiFi details.</p>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  House rules
                </h3>
                {property.houseRules.length === 0 ? (
                  <p className="text-[13px] text-text-muted">No house rules.</p>
                ) : (
                  <ol className="list-decimal space-y-1 pl-4 text-[13px] text-text-primary">
                    {property.houseRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ol>
                )}
              </section>

              <Field label="Laundry" value={property.laundry} />
              <Field
                label="Laundry escalation"
                value={formatEscalation(property.laundryEscalation)}
              />
              <Field label="Waste" value={property.waste} />

              {(property.accessSummary?.lockboxCode ||
                property.accessSummary?.keyNest ||
                property.accessSummary?.doorCode ||
                property.accessSummary?.accessNotes) && (
                <section className="space-y-3">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                    Access
                  </h3>
                  <Field label="Lockbox code" value={property.accessSummary.lockboxCode} />
                  <Field label="KeyNest" value={property.accessSummary.keyNest} />
                  <Field label="Door code" value={property.accessSummary.doorCode} />
                  <Field label="Access notes" value={property.accessSummary.accessNotes} />
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  Systems
                </h3>
                {systemEntries.length === 0 ? (
                  <p className="text-[13px] text-text-muted">No systems configured.</p>
                ) : (
                  <ul className="space-y-3">
                    {systemEntries.map(([key, info]) => (
                      <li key={key} className="text-[13px] text-text-primary">
                        <p className="font-medium">{SYSTEM_LABELS[key]}</p>
                        {info.info ? (
                          <p className="mt-1 whitespace-pre-wrap text-text-secondary">{info.info}</p>
                        ) : null}
                        {formatEscalation(info.escalation) ? (
                          <p className="mt-1 text-text-secondary">
                            Escalation: {formatEscalation(info.escalation)}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-3">
                <Field label="Guide URL" value={property.guideUrl} />
                <Field label="Listing URL" value={property.listingUrl} />
                <Field label="Media folder" value={property.mediaFolderUrl} />
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
          {property && onEdit ? (
            <Button
              type="button"
              size="lg"
              onClick={() => {
                onOpenChange(false);
                onEdit(property.id);
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
