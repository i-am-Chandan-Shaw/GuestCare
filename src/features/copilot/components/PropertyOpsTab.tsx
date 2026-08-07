import {
  ArrowUpDown,
  CircleAlert,
  CigaretteOff,
  Droplet,
  Droplets,
  ExternalLink,
  Flame,
  Footprints,
  KeyRound,
  Lightbulb,
  Moon,
  PawPrint,
  PhoneCall,
  Shirt,
  Siren,
  Trash2,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SectionCard } from "@/components/ui/UiKit";
import { LinkifiedText } from "@/shared/components/LinkifiedText";
import { SYSTEM_LABELS } from "@/shared/constants/system-labels";
import type { CustomerContact, Property, SystemKey } from "@/shared/types";
import { ExpandableNote, FieldLabel, PhoneRow, propertyCardClass } from "./PropertyDetailSections";

const SYSTEM_ICONS: Record<SystemKey, LucideIcon> = {
  heating: Flame,
  alarms: Siren,
  breakIn: CircleAlert,
  locksmith: KeyRound,
  drains: Droplets,
  emergencyLights: Lightbulb,
  electrical: Zap,
  gas: Flame,
  leak: Droplet,
  lifts: ArrowUpDown,
  waterSupply: Droplets,
};

function houseRuleIcon(rule: string): LucideIcon {
  const text = rule.toLowerCase();
  if (text.includes("shoe")) return Footprints;
  if (text.includes("smok") || text.includes("vap")) return CigaretteOff;
  if (text.includes("pet")) return PawPrint;
  if (text.includes("guest")) return Users;
  if (text.includes("quiet")) return Moon;
  return CircleAlert;
}

export function PropertyOpsTab({
  property,
  contacts = [],
}: {
  property: Property;
  contacts?: CustomerContact[];
}) {
  const systemEntries = Object.entries(property.systems) as [
    SystemKey,
    { info?: string; escalation?: unknown },
  ][];

  return (
    <>
      {property.houseRules.length > 0 && (
        <SectionCard title="House Rules" className={propertyCardClass}>
          <ul className="space-y-2.5 py-1">
            {property.houseRules.map((rule) => {
              const Icon = houseRuleIcon(rule);
              return (
                <li key={rule} className="flex items-center gap-2 text-[12.5px] text-foreground">
                  <Icon
                    className="block size-[1em] shrink-0 -translate-y-px text-text-muted"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <span className="leading-none">{rule}</span>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}

      {(property.laundry || property.waste) && (
        <SectionCard title="Laundry & Waste" className={propertyCardClass} padded={false}>
          <div className="divide-y divide-border/60">
            {property.laundry ? (
              <div className="px-4 py-3">
                <FieldLabel
                  icon={Shirt}
                  className="text-[11.5px] font-semibold text-muted-foreground"
                >
                  Laundry
                </FieldLabel>
                <p className="mt-1 text-[12.5px] leading-relaxed text-foreground">
                  {property.laundry}
                </p>
              </div>
            ) : null}
            {property.waste ? (
              <div className="px-4 py-3">
                <FieldLabel
                  icon={Trash2}
                  className="text-[11.5px] font-semibold text-muted-foreground"
                >
                  Waste
                </FieldLabel>
                <p className="mt-1 text-[12.5px] leading-relaxed text-foreground">
                  {property.waste}
                </p>
              </div>
            ) : null}
          </div>
        </SectionCard>
      )}

      {systemEntries.length > 0 && (
        <SectionCard title="Utilities & Systems" className={propertyCardClass} padded={false}>
          <div className="divide-y divide-border/60">
            {systemEntries.map(([key, sys]) => (
              <ExpandableNote
                key={key}
                title={SYSTEM_LABELS[key]}
                icon={SYSTEM_ICONS[key]}
                text={[
                  sys.info,
                  typeof sys.escalation === "string"
                    ? `Escalation: ${
                        sys.escalation === "host"
                          ? "Call Host"
                          : sys.escalation === "emergency-then-host"
                            ? "Call emergency services then host"
                            : sys.escalation
                      }`
                    : sys.escalation &&
                        typeof sys.escalation === "object" &&
                        "custom" in sys.escalation
                      ? `Escalation: ${sys.escalation.custom}`
                      : "",
                ]
                  .filter(Boolean)
                  .join("\n\n")}
              />
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard title="Property Notes" className={propertyCardClass}>
        <p className="py-1 text-[12.5px] leading-relaxed text-foreground">
          <LinkifiedText text={property.specificInfo} />
        </p>
        {property.mediaFolderUrl && (
          <a
            href={property.mediaFolderUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
          >
            Media folder <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </SectionCard>

      <SectionCard title="Emergency Contacts" className={propertyCardClass} padded={false}>
        <div className="divide-y divide-border/60">
          {contacts.length === 0 ? (
            <p className="px-4 py-3 text-[12.5px] text-muted-foreground">
              No emergency contacts on file.
            </p>
          ) : (
            contacts.map((contact) => (
              <PhoneRow
                key={contact.id}
                label={
                  contact.label && contact.name && contact.label !== contact.name
                    ? `${contact.label.replace(/:\s*$/, "")}: ${contact.name}`
                    : contact.label || contact.name
                }
                value={contact.phone}
                icon={PhoneCall}
              />
            ))
          )}
          <PhoneRow label="Emergency Services" value="999" red icon={Siren} />
        </div>
      </SectionCard>
    </>
  );
}
