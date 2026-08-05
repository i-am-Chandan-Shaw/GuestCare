import { cn } from "@/lib/utils";

const LABEL_WIDTHS = ["w-14", "w-16", "w-20", "w-12", "w-[4.5rem]", "w-24"] as const;
const VALUE_WIDTHS = ["w-[48%]", "w-[62%]", "w-[55%]", "w-[40%]", "w-[70%]", "w-[52%]"] as const;

/** Matches FloatingLabel input shells: h-12 + kn-radius-lg + input border. */
function FieldSkeleton({
  labelWidth,
  valueWidth,
}: {
  labelWidth: string;
  valueWidth: string;
}) {
  return (
    <div className="gc-form-skeleton__field relative h-12 overflow-hidden rounded-[var(--kn-radius-lg)] border border-input-border">
      <div className="relative z-[1] px-3 pt-2">
        <div className={cn("gc-form-skeleton__bar h-1.5 rounded-sm", labelWidth)} />
      </div>
      <div className="relative z-[1] px-3 pt-2">
        <div
          className={cn("gc-form-skeleton__bar gc-form-skeleton__bar--value h-2.5 rounded-sm", valueWidth)}
        />
      </div>
      <div className="gc-form-skeleton__shimmer" aria-hidden />
    </div>
  );
}

/** Placeholder that mirrors floating-label inputs (same 48px height) while modals hydrate. */
export function DirectoryFormSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("gc-form-skeleton space-y-4", className)}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="gc-form-skeleton__row"
          style={{ ["--gc-skeleton-delay" as string]: `${index * 90}ms` }}
        >
          <FieldSkeleton
            labelWidth={LABEL_WIDTHS[index % LABEL_WIDTHS.length]!}
            valueWidth={VALUE_WIDTHS[index % VALUE_WIDTHS.length]!}
          />
        </div>
      ))}
    </div>
  );
}
