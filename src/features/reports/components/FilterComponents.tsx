import type { ReactNode } from "react";
import { Check, ChevronDown, ChevronUp, Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterCheckbox({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded-md py-1.5 text-left transition-colors hover:bg-app-bg"
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-border-color bg-card-bg",
        )}
        aria-hidden
      >
        {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      <span className="text-[13px] text-text-primary">{label}</span>
    </button>
  );
}

export function FilterSection({
  title,
  icon: Icon,
  iconClassName,
  badge,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  badge: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-app-bg/60"
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            iconClassName,
          )}
          aria-hidden
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 text-[13px] font-semibold text-text-primary">{title}</span>
        <span className="inline-flex shrink-0 items-center rounded-full bg-app-bg px-2 py-0.5 text-[11px] font-medium text-text-secondary">
          {badge}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={2} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={2} />
        )}
      </button>
      {open ? <div className="px-4 pb-3.5">{children}</div> : null}
    </div>
  );
}

export function ListSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 rounded-md border border-border-color bg-app-bg px-2.5 py-1.5">
      <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={2} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[12px] text-text-primary outline-none placeholder:text-text-muted"
      />
    </div>
  );
}
