import { Copy, Phone, ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/copy-to-clipboard";

export type PropertyTab = "access" | "ops";

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
    <div className="grid h-9 w-full grid-cols-2 rounded-lg border border-border-color bg-slate-100/80 p-0.5">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "w-full cursor-pointer rounded-md py-1.5 text-center text-[13px] font-semibold leading-none transition-colors",
              isActive
                ? "bg-white text-brand-primary shadow-sm"
                : "bg-transparent text-text-secondary hover:text-text-primary",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function FieldLabel({
  icon: Icon,
  children,
  className,
}: {
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {Icon ? (
        <Icon
          aria-hidden
          strokeWidth={2}
          className="block size-[1em] shrink-0 -translate-y-px text-text-muted"
        />
      ) : null}
      <span className="leading-none">{children}</span>
    </span>
  );
}

export function CopyRow({
  label,
  value,
  mono = false,
  sublabel,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  sublabel?: string;
  icon?: LucideIcon;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const ok = await copyText(value, `${label} copied`);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
      <div className="min-w-0 shrink-0 max-w-[42%]">
        <FieldLabel icon={icon} className="font-medium text-text-secondary">
          {label}
        </FieldLabel>
        {sublabel && (
          <p className="mt-0.5 break-words text-[11px] text-text-secondary/80">{sublabel}</p>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-start justify-end gap-2">
        <span
          className={cn(
            "break-words text-right text-text-primary",
            mono ? "break-all font-mono font-medium" : "font-medium",
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "mt-0.5 shrink-0 cursor-pointer transition-colors",
            copied ? "text-success" : "text-text-secondary hover:text-text-primary",
          )}
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function PhoneRow({
  label,
  value,
  red = false,
  icon,
}: {
  label: string;
  value: string;
  red?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <FieldLabel icon={icon} className="text-[11.5px] font-semibold text-text-secondary">
          {label}
        </FieldLabel>
        <a
          href={`tel:${value.replace(/\s/g, "")}`}
          className={cn(
            "shrink-0 cursor-pointer transition-colors",
            red ? "text-danger hover:opacity-80" : "text-text-secondary hover:text-text-primary",
          )}
          aria-label={`Call ${label}`}
        >
          <Phone className="h-3.5 w-3.5" />
        </a>
      </div>
      <p
        className={cn(
          "mt-1 break-all font-mono text-[13px] font-medium",
          red ? "text-danger" : "text-text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ExpandableNote({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon?: LucideIcon;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 py-3 text-[13px] font-medium text-text-secondary hover:text-text-primary"
      >
        <FieldLabel icon={icon}>{title}</FieldLabel>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        )}
      </button>
      {open && (
        <p className="whitespace-pre-wrap pb-3 text-[12.5px] leading-relaxed text-text-primary">
          {text}
        </p>
      )}
    </div>
  );
}

export function StackedCopyField({
  label,
  value,
  mono = false,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: LucideIcon;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    const ok = await copyText(value, `${label} copied`);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <FieldLabel icon={icon} className="text-[11.5px] font-semibold text-text-secondary">
          {label}
        </FieldLabel>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "shrink-0 cursor-pointer transition-colors",
            copied ? "text-success" : "text-text-secondary hover:text-text-primary",
          )}
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      <p
        className={cn(
          "mt-1 break-words text-[13px] font-medium text-text-primary",
          mono && "break-all font-mono",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function StackedField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="px-4 py-3">
      <FieldLabel icon={icon} className="text-[11.5px] font-semibold text-text-secondary">
        {label}
      </FieldLabel>
      <p className="mt-1 break-words text-[13px] font-medium text-text-primary">{value}</p>
    </div>
  );
}

export const propertyCardClass = "rounded-xl border border-border-color bg-card-bg shadow-sm";
