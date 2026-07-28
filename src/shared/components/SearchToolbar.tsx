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
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-11 w-full rounded-full border border-border/80 bg-white pl-11 pr-4 text-[13.5px] text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </div>
        {hasFilter && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>
      {resultLabel && <p className="pl-1 text-[12px] text-muted-foreground">{resultLabel}</p>}
    </div>
  );
}

export function filterBySearch<T>(items: T[], search: string, getText: (item: T) => string): T[] {
  const query = search.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => getText(item).toLowerCase().includes(query));
}
