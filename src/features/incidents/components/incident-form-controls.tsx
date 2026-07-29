import { Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyIconButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(value && value !== "—");

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!canCopy}
      aria-label={`Copy ${label}`}
      className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
        canCopy
          ? "text-muted-foreground hover:text-foreground cursor-pointer"
          : "text-muted-foreground/40 cursor-not-allowed",
      )}
    >
      {copied ? (
        <span className="text-[10px] text-success font-semibold">Copied!</span>
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="mb-2 block text-[13px] font-semibold text-text-primary">{label}</span>
      {children}
    </div>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  mono,
  readOnly,
  type = "text",
  className,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  readOnly?: boolean;
  type?: React.HTMLInputTypeAttribute;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      className={cn(
        "h-11 w-full rounded-lg border border-input-border bg-input-surface px-3 text-[13px] text-text-primary outline-none transition-all placeholder:text-text-muted shadow-sm",
        "focus:border-input-border-focus focus:ring-2 focus:ring-brand-primary/20",
        readOnly &&
          "bg-app-bg/60 text-text-secondary cursor-default focus:ring-0 focus:border-input-border",
        mono && "font-mono",
        className,
      )}
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      rows={rows}
      readOnly={readOnly}
      className={cn(
        "w-full resize-none rounded-lg border border-input-border bg-input-surface px-3 py-2.5 text-[13px] text-text-primary outline-none transition-all placeholder:text-text-muted shadow-sm focus:border-input-border-focus focus:ring-2 focus:ring-brand-primary/20",
        readOnly && "bg-app-bg/60 text-text-secondary cursor-default focus:ring-0",
      )}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  optionLabels,
  disabled,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  optionLabels?: Record<string, string>;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "h-11 w-full rounded-lg border border-input-border bg-input-surface px-3 text-[13px] font-medium text-text-primary outline-none transition-all shadow-sm focus:border-input-border-focus focus:ring-2 focus:ring-brand-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%23666%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] cursor-pointer",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o} value={o.startsWith("P") && o.includes("·") ? o.split(" ")[0] : o}>
          {optionLabels?.[o] ?? o}
        </option>
      ))}
    </select>
  );
}
