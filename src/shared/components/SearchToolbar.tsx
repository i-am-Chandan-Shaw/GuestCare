import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

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
  const hasFilter = Boolean(value.trim());

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-9 w-full rounded-lg border border-input-border bg-card-bg pl-10 pr-4 text-xs text-text-primary shadow-sm outline-none transition-all placeholder:text-text-secondary focus:border-input-border-focus focus:ring-2 focus:ring-brand-primary/15"
          />
        </div>
        {hasFilter && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            Clear filters
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
