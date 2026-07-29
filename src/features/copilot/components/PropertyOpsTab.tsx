import { ExternalLink } from "lucide-react";
import { SectionCard } from "@/shared/components/ui-kit";
import { SYSTEM_LABELS } from "@/shared/constants/system-labels";
import type { Property, SystemKey } from "@/shared/types";
import { ExpandableNote, PhoneRow, propertyCardClass } from "./property-shared";

export function PropertyOpsTab({ property }: { property: Property }) {
  const systemEntries = Object.entries(property.systems) as [
    SystemKey,
    { info?: string; escalation?: unknown },
  ][];

  return (
    <>
      {property.houseRules.length > 0 && (
        <SectionCard title="House Rules" className={propertyCardClass}>
          <ul className="space-y-1.5 py-1">
            {property.houseRules.map((r) => (
              <li key={r} className="text-[12.5px] text-foreground flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {(property.laundry || property.waste) && (
        <SectionCard title="Laundry & Waste" className={propertyCardClass}>
          {property.laundry && (
            <div className="py-2">
              <span className="text-[11.5px] font-semibold text-muted-foreground">Laundry</span>
              <p className="text-[12.5px] text-foreground mt-1 leading-relaxed">{property.laundry}</p>
            </div>
          )}
          {property.waste && (
            <div className="py-2 border-t border-border/60">
              <span className="text-[11.5px] font-semibold text-muted-foreground">Waste</span>
              <p className="text-[12.5px] text-foreground mt-1 leading-relaxed">{property.waste}</p>
            </div>
          )}
        </SectionCard>
      )}

      {systemEntries.length > 0 && (
        <SectionCard title="Utilities & Systems" className={propertyCardClass} padded={false}>
          <div className="px-4 divide-y divide-border/60">
            {systemEntries.map(([key, sys]) => (
              <ExpandableNote
                key={key}
                title={SYSTEM_LABELS[key]}
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
        <p className="text-[12.5px] leading-relaxed text-foreground whitespace-pre-wrap py-1">
          {property.specificInfo}
        </p>
        {property.mediaFolderUrl && (
          <a
            href={property.mediaFolderUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline mt-2"
          >
            Media folder <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </SectionCard>

      <SectionCard title="Emergency Contacts" className={propertyCardClass} padded={false}>
        <div className="px-4 divide-y divide-border/60">
          {property.hosts.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground py-3">No host contacts on file.</p>
          ) : (
            property.hosts.map((h) => (
              <PhoneRow key={`${h.name}-${h.phone}`} label={`Host (${h.name})`} value={h.phone} />
            ))
          )}
          <PhoneRow label="Emergency Services" value="999" red />
        </div>
      </SectionCard>
    </>
  );
}
