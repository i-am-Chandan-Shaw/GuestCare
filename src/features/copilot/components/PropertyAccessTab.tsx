import {
  Car,
  ClipboardList,
  Key,
  KeyRound,
  Layers,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  ShieldAlert,
  Users,
  Wifi,
} from "lucide-react";
import { SectionCard } from "@/shared/components/ui-kit";
import type { Property } from "@/shared/types";
import {
  CopyRow,
  ExpandableNote,
  FieldLabel,
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
            <FieldLabel
              icon={LogIn}
              className="text-[11.5px] font-semibold text-muted-foreground"
            >
              Check-in
            </FieldLabel>
            <span className="text-[13px] font-semibold text-foreground">
              {property.checkIn.time}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel
              icon={LogOut}
              className="text-[11.5px] font-semibold text-muted-foreground"
            >
              Check-out
            </FieldLabel>
            <span className="text-[13px] font-semibold text-foreground">
              {property.checkOut.time}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel
              icon={Users}
              className="text-[11.5px] font-semibold text-muted-foreground"
            >
              Max Guests
            </FieldLabel>
            <span className="text-[13px] font-semibold text-foreground">
              {property.maxGuests} Guests
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <FieldLabel
              icon={Layers}
              className="text-[11.5px] font-semibold text-muted-foreground"
            >
              {property.floor ? "Floor" : "Unit"}
            </FieldLabel>
            <span className="text-[13px] font-semibold text-foreground">
              {property.floor || property.unit || "—"}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Access Information" className={propertyCardClass} padded={false}>
        <div className="divide-y divide-border/60">
          {accessCode ? (
            <CopyRow label="Access Code" value={accessCode} mono icon={KeyRound} />
          ) : null}
          {property.accessSummary?.keyNest ? (
            <StackedCopyField
              label="KeyNest"
              value={property.accessSummary.keyNest}
              icon={Key}
            />
          ) : null}
          {property.spareKeys ? (
            <ExpandableNote
              title="Spare / Emergency"
              text={property.spareKeys}
              icon={ShieldAlert}
            />
          ) : null}
          {property.parking ? (
            <CopyRow label="Parking" value={property.parking} icon={Car} />
          ) : null}
          {property.checkIn.instructions ? (
            <ExpandableNote
              title="Check-in instructions"
              text={property.checkIn.instructions}
              icon={ClipboardList}
            />
          ) : null}
          {property.checkOut.instructions ? (
            <ExpandableNote
              title="Check-out instructions"
              text={property.checkOut.instructions}
              icon={LogOut}
            />
          ) : null}
        </div>
      </SectionCard>

      {(property.wifi.network || property.wifi.password || property.wifi.raw) && (
        <SectionCard title="WiFi" className={propertyCardClass} padded={false}>
          <div className="divide-y divide-border/60">
            {property.wifi.network ? (
              <StackedCopyField
                label="Network"
                value={property.wifi.network}
                icon={Wifi}
              />
            ) : null}
            {property.wifi.location ? (
              <StackedField label="Place" value={property.wifi.location} icon={MapPin} />
            ) : null}
            {property.wifi.password ? (
              <StackedCopyField
                label="Password"
                value={property.wifi.password}
                mono
                icon={Lock}
              />
            ) : null}
            {!property.wifi.network && !property.wifi.password && property.wifi.raw ? (
              <p className="break-words px-4 py-3 text-[12.5px] leading-relaxed text-foreground">
                {property.wifi.raw}
              </p>
            ) : null}
          </div>
        </SectionCard>
      )}
    </>
  );
}
