import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import type { Ref } from "react";

export function SearchToolbar({
  value,
  onChange,
  placeholder,
  resultLabel,
  onClear,
  className,
  layout = "stacked",
  inputRef,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  resultLabel?: string;
  onClear?: () => void;
  className?: string;
  layout?: "stacked" | "inline";
  inputRef?: Ref<HTMLInputElement>;
  disabled?: boolean;
}) {
  const hasSearch = Boolean(value.trim());
  const showClear = hasSearch && Boolean(onClear) && !disabled;

  const searchInput = (
    <div className="relative min-w-0">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "h-9 w-full rounded-lg border border-input-border bg-card-bg pl-10 text-xs text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-input-border-focus focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60",
          showClear ? "pr-10" : "pr-4",
        )}
      />
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition-colors hover:text-text-primary"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );

  if (layout === "inline") {
    return <div className={cn("min-w-0", className)}>{searchInput}</div>;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {searchInput}
      {resultLabel && <p className="pl-1 text-[12px] text-text-secondary">{resultLabel}</p>}
    </div>
  );
}

export function filterBySearch<T>(items: T[], search: string, getText: (item: T) => string): T[] {
  const query = search.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => getText(item).toLowerCase().includes(query));
}
