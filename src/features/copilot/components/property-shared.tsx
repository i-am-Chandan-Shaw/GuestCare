import { Copy, Phone, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/copy-to-clipboard";

export type PropertyTab = "access" | "ops";

const PILL_ACTIVE = "#50B08B";

export function PropertyTabs({
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
      className="grid w-full grid-cols-2 rounded-sm bg-white p-1"
      style={{ border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="w-full cursor-pointer rounded-sm py-[10px] text-center text-[14px] font-bold leading-none transition-colors"
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

export function CopyRow({
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

export function PhoneRow({ label, value, red = false }: { label: string; value: string; red?: boolean }) {
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

export function ExpandableNote({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer flex w-full items-center justify-between gap-3 py-3 text-[13px] font-medium text-muted-foreground hover:text-foreground"
      >
        <span>{title}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
      </button>
      {open && (
        <p className="pb-3 text-[12.5px] leading-relaxed text-foreground whitespace-pre-wrap">{text}</p>
      )}
    </div>
  );
}

export function StackedCopyField({
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
      <p className={cn("mt-1 text-[13px] font-medium text-foreground break-words", mono && "font-mono break-all")}>
        {value}
      </p>
    </div>
  );
}

export function StackedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3">
      <p className="text-[11.5px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-[13px] font-medium text-foreground break-words">{value}</p>
    </div>
  );
}

export const propertyCardClass = "shadow-sm border border-border rounded-sm";
