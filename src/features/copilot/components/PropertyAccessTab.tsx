import { SectionCard } from "@/shared/components/copilot";
import type { Property } from "@/shared/types";
import {
  CopyRow,
  ExpandableNote,
  StackedCopyField,
  StackedField,
  propertyCardClass,
} from "./property-shared";

export function PropertyAccessTab({ property }: { property: Property }) {
  const accessCode = property.accessSummary?.lockboxCode || property.accessSummary?.doorCode;

  return (
    <>
      <SectionCard title="Property Overview" className={propertyCardClass}>
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 pb-1 pt-1">
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-semibold text-muted-foreground">Check-in</span>
            <span className="text-[13px] font-semibold text-foreground">{property.checkIn.time}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-semibold text-muted-foreground">Check-out</span>
            <span className="text-[13px] font-semibold text-foreground">{property.checkOut.time}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-semibold text-muted-foreground">Max Guests</span>
            <span className="text-[13px] font-semibold text-foreground">{property.maxGuests} Guests</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-semibold text-muted-foreground">
              {property.floor ? "Floor" : "Unit"}
            </span>
            <span className="text-[13px] font-semibold text-foreground">
              {property.floor || property.unit || "—"}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Access Information" className={propertyCardClass} padded={false}>
        <div className="px-4 divide-y divide-border/60">
          {accessCode && <CopyRow label="Access Code" value={accessCode} mono />}
          {property.accessSummary?.keyNest && (
            <StackedCopyField label="KeyNest" value={property.accessSummary.keyNest} />
          )}
          {property.spareKeys && <ExpandableNote title="Spare / Emergency" text={property.spareKeys} />}
          {property.parking && <CopyRow label="Parking" value={property.parking} />}
          {property.checkIn.instructions && (
            <ExpandableNote title="Check-in instructions" text={property.checkIn.instructions} />
          )}
          {property.checkOut.instructions && (
            <ExpandableNote title="Check-out instructions" text={property.checkOut.instructions} />
          )}
        </div>
      </SectionCard>

      {(property.wifi.network || property.wifi.password || property.wifi.raw) && (
        <SectionCard title="WiFi" className={propertyCardClass} padded={false}>
          <div className="px-4 divide-y divide-border/60">
            {property.wifi.network && <StackedCopyField label="Network" value={property.wifi.network} />}
            {property.wifi.location && <StackedField label="Place" value={property.wifi.location} />}
            {property.wifi.password && (
              <StackedCopyField label="Password" value={property.wifi.password} mono />
            )}
            {!property.wifi.network && !property.wifi.password && property.wifi.raw && (
              <p className="py-3 text-[12.5px] leading-relaxed text-foreground break-words">
                {property.wifi.raw}
              </p>
            )}
          </div>
        </SectionCard>
      )}
    </>
  );
}
