import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export function SearchToolbar({
  value,
  onChange,
  placeholder,
  resultLabel,
  onClear,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  resultLabel?: string;
  onClear?: () => void;
  className?: string;
}) {
  const hasSearch = Boolean(value.trim());

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-9 w-full rounded-lg border border-input-border bg-card-bg pl-10 text-xs text-text-primary shadow-sm outline-none transition-all placeholder:text-text-muted focus:border-input-border-focus focus:ring-2 focus:ring-brand-primary/15",
            hasSearch && onClear ? "pr-10" : "pr-4",
          )}
        />
        {hasSearch && onClear && (
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
      {resultLabel && <p className="pl-1 text-[12px] text-text-secondary">{resultLabel}</p>}
    </div>
  );
}

export function filterBySearch<T>(items: T[], search: string, getText: (item: T) => string): T[] {
  const query = search.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => getText(item).toLowerCase().includes(query));
}
