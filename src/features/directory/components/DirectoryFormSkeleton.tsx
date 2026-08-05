import { cn } from "@/lib/utils";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--kn-radius-lg)] bg-[var(--kn-color-skeleton)]",
        className,
      )}
    />
  );
}

/** Placeholder that mirrors floating-label input rows while edit modals hydrate. */
export function DirectoryFormSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonBar
          key={index}
          className={cn("h-12 w-full", index === rows - 1 && rows > 3 && "h-24")}
        />
      ))}
    </div>
  );
}
