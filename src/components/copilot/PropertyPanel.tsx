import { SectionCard } from "./ui";
import type { Property, SystemKey } from "@/data/mock";
import { SYSTEM_LABELS, getPropertyAccessCode } from "@/data/mock";
import {
  Building2,
  Copy,
  Phone,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/copy-to-clipboard";

export type PropertyTab = "access" | "ops";

function CopyRow({
  label,
  value,
  mono = false,
  sublabel,
}: {
  label: string;
  value: string;
  mono?: boolean;
  sublabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const ok = await copyText(value, `${label} copied`);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-[13px]">
      <div className="min-w-0 shrink-0 max-w-[42%]">
        <span className="text-muted-foreground font-medium">{label}</span>
        {sublabel && (
          <p className="text-[11px] text-muted-foreground/80 break-words mt-0.5">{sublabel}</p>
        )}
      </div>
      <div className="flex items-start gap-2 min-w-0 flex-1 justify-end">
        <span
          className={cn(
            "text-foreground text-right break-words",
            mono ? "font-mono font-medium break-all" : "font-medium",
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "cursor-pointer shrink-0 mt-0.5 transition-colors",
            copied ? "text-success" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function PhoneRow({ label, value, red = false }: { label: string; value: string; red?: boolean }) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11.5px] font-semibold text-muted-foreground">{label}</p>
        <a
          href={`tel:${value.replace(/\s/g, "")}`}
          className={cn(
            "cursor-pointer shrink-0 transition-colors",
            red ? "text-destructive hover:opacity-80" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={`Call ${label}`}
        >
          <Phone className="h-3.5 w-3.5" />
        </a>
      </div>
      <p
        className={cn(
          "mt-1 text-[13px] font-medium break-all font-mono",
          red ? "text-destructive" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ExpandableNote({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer flex w-full items-center justify-between gap-3 py-3 text-[13px] font-medium text-muted-foreground hover:text-foreground"
      >
        <span>{title}</span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        )}
      </button>
      {open && (
        <p className="pb-3 text-[12.5px] leading-relaxed text-foreground whitespace-pre-wrap">
          {text}
        </p>
      )}
    </div>
  );
}

function StackedCopyField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const ok = await copyText(value, `${label} copied`);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11.5px] font-semibold text-muted-foreground">{label}</p>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "cursor-pointer shrink-0 transition-colors",
            copied ? "text-success" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      <p
        className={cn(
          "mt-1 text-[13px] font-medium text-foreground break-words",
          mono && "font-mono break-all",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StackedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3">
      <p className="text-[11.5px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-[13px] font-medium text-foreground break-words">{value}</p>
    </div>
  );
}

/** Exact active fill from the emerald capsule screenshot */
const PILL_ACTIVE = "#50B08B";

function PropertyTabs({
  active,
  onChange,
}: {
  active: PropertyTab;
  onChange: (t: PropertyTab) => void;
}) {
  const tabs: { id: PropertyTab; label: string }[] = [
    { id: "access", label: "Access" },
    { id: "ops", label: "Ops" },
  ];

  return (
    <div
      className="grid w-full grid-cols-2 rounded-lg bg-white p-1"
      style={{
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="w-full cursor-pointer rounded-md py-[10px] text-center text-[14px] font-bold leading-none transition-colors"
            style={
              isActive
                ? { backgroundColor: PILL_ACTIVE, color: "#ffffff" }
                : { backgroundColor: "transparent", color: "#111827" }
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function PropertyPanel({
  property,
  tab = "access",
  onTabChange,
}: {
  property: Property | null;
  onPick?: (p: Property) => void;
  tab?: PropertyTab;
  onTabChange?: (t: PropertyTab) => void;
}) {
  const [internalTab, setInternalTab] = useState<PropertyTab>("access");
  const activeTab = onTabChange ? tab : internalTab;
  const setTab = onTabChange ?? setInternalTab;

  if (!property) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background p-5">
        <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center max-w-[220px]">
          <Building2 className="mx-auto h-7 w-7 text-muted-foreground" />
          <p className="mt-3 text-[13px] font-medium text-foreground">No property selected</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
            Pick a property from the top bar to load details.
          </p>
        </div>
      </div>
    );
  }

  const accessCode = getPropertyAccessCode(property);
  const systemEntries = Object.entries(property.systems) as [
    SystemKey,
    { info?: string; escalation?: unknown },
  ][];
  const cardClass = "shadow-sm border border-border rounded-lg";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-thin p-4">
        <div className="space-y-4">
          {/* Inset hero card */}
          <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=800&h=400"
              alt={property.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            <button
              type="button"
              className="cursor-pointer absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm text-warning hover:bg-white transition-colors"
            >
              <Star className="h-3.5 w-3.5 fill-current" />
            </button>
            <div className="absolute bottom-3 left-4 right-4">
              <h2 className="text-[18px] font-bold tracking-tight text-white drop-shadow-sm">
                {property.name}
              </h2>
              <div className="mt-1 flex items-start gap-1.5 text-[12px] text-white/90">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span className="leading-snug line-clamp-2">{property.address}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {property.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground border border-border"
              >
                {t}
              </span>
            ))}
            {property.unit && !property.tags.includes(property.unit) && (
              <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground border border-border">
                {property.unit}
              </span>
            )}
          </div>

          {(property.guideUrl || property.listingUrl) && (
            <div className="grid grid-cols-2 gap-2">
              {property.guideUrl && (
                <a
                  href={property.guideUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-2 text-[11.5px] font-semibold text-foreground hover:bg-surface-2 transition-colors shadow-sm"
                >
                  Property Guide
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              )}
              {property.listingUrl && (
                <a
                  href={property.listingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-2 text-[11.5px] font-semibold text-foreground hover:bg-surface-2 transition-colors shadow-sm"
                >
                  Listing
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="sticky top-[-16px] z-20 -mx-4 bg-background px-4 pb-3 pt-4">
          <PropertyTabs active={activeTab} onChange={setTab} />
        </div>

        <div className="space-y-4 pb-2">
          {activeTab === "access" && (
            <>
              <SectionCard title="Property Overview" className={cardClass}>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 pb-1 pt-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11.5px] font-semibold text-muted-foreground">Check-in</span>
                    <span className="text-[13px] font-semibold text-foreground">
                      {property.checkIn.time}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11.5px] font-semibold text-muted-foreground">Check-out</span>
                    <span className="text-[13px] font-semibold text-foreground">
                      {property.checkOut.time}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11.5px] font-semibold text-muted-foreground">Max Guests</span>
                    <span className="text-[13px] font-semibold text-foreground">
                      {property.maxGuests} Guests
                    </span>
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

              <SectionCard title="Access Information" className={cardClass} padded={false}>
                <div className="px-4 divide-y divide-border/60">
                  {accessCode && <CopyRow label="Access Code" value={accessCode} mono />}
                  {property.accessSummary?.keyNest && (
                    <StackedCopyField label="KeyNest" value={property.accessSummary.keyNest} />
                  )}
                  {property.spareKeys && (
                    <ExpandableNote title="Spare / Emergency" text={property.spareKeys} />
                  )}
                  {property.parking && <CopyRow label="Parking" value={property.parking} />}
                  {property.checkIn.instructions && (
                    <ExpandableNote title="Check-in instructions" text={property.checkIn.instructions} />
                  )}
                  {property.checkOut.instructions && (
                    <ExpandableNote
                      title="Check-out instructions"
                      text={property.checkOut.instructions}
                    />
                  )}
                </div>
              </SectionCard>

              {(property.wifi.network || property.wifi.password || property.wifi.raw) && (
                <SectionCard title="WiFi" className={cardClass} padded={false}>
                  <div className="px-4 divide-y divide-border/60">
                    {property.wifi.network && (
                      <StackedCopyField label="Network" value={property.wifi.network} />
                    )}
                    {property.wifi.location && (
                      <StackedField label="Place" value={property.wifi.location} />
                    )}
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
          )}

          {activeTab === "ops" && (
            <>
              {property.houseRules.length > 0 && (
                <SectionCard title="House Rules" className={cardClass}>
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
                <SectionCard title="Laundry & Waste" className={cardClass}>
                  {property.laundry && (
                    <div className="py-2">
                      <span className="text-[11.5px] font-semibold text-muted-foreground">Laundry</span>
                      <p className="text-[12.5px] text-foreground mt-1 leading-relaxed">
                        {property.laundry}
                      </p>
                    </div>
                  )}
                  {property.waste && (
                    <div className="py-2 border-t border-border/60">
                      <span className="text-[11.5px] font-semibold text-muted-foreground">Waste</span>
                      <p className="text-[12.5px] text-foreground mt-1 leading-relaxed">
                        {property.waste}
                      </p>
                    </div>
                  )}
                </SectionCard>
              )}

              {systemEntries.length > 0 && (
                <SectionCard title="Utilities & Systems" className={cardClass} padded={false}>
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

              <SectionCard title="Property Notes" className={cardClass}>
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

              <SectionCard title="Emergency Contacts" className={cardClass} padded={false}>
                <div className="px-4 divide-y divide-border/60">
                  {property.hosts.length === 0 ? (
                    <p className="text-[12.5px] text-muted-foreground py-3">No host contacts on file.</p>
                  ) : (
                    property.hosts.map((h) => (
                      <PhoneRow
                        key={`${h.name}-${h.phone}`}
                        label={`Host (${h.name})`}
                        value={h.phone}
                      />
                    ))
                  )}
                  <PhoneRow label="Emergency Services" value="999" red />
                </div>
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
