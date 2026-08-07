import { cn } from "@/lib/utils";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-border-color/60", className)} aria-hidden />
  );
}

function SkeletonCircle({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse shrink-0 rounded-full bg-border-color/70", className)}
      aria-hidden
    />
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-border-color/50", className)} aria-hidden />
  );
}

function SkeletonPill({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse h-6 w-16 rounded-full bg-border-color/55", className)}
      aria-hidden
    />
  );
}

/** Full-page placeholder mirroring ReportDetailPage layout while detail loads. */
export function ReportDetailSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-app-bg"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading report…</span>

      <div className="flex shrink-0 items-center gap-2 border-b border-border-color bg-card-bg px-4 py-3">
        <SkeletonBlock className="h-7 w-7 rounded-md" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <SkeletonBar className="h-2.5 w-20" />
          <SkeletonBar className="h-3.5 w-48 max-w-[60%]" />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <article className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg shadow-sm">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <SkeletonCircle className="h-10 w-10" />
                  <div className="min-w-0 space-y-2 pt-0.5">
                    <SkeletonBar className="h-3.5 w-36" />
                    <SkeletonBar className="h-2.5 w-52 max-w-full" />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <SkeletonBar className="h-7 w-24 rounded-md" />
                  <SkeletonBar className="h-8 w-28 rounded-md" />
                </div>
              </div>

              <SkeletonBar className="h-6 w-[70%] max-w-md" />

              <div className="space-y-2">
                <SkeletonBar className="h-3 w-full" />
                <SkeletonBar className="h-3 w-[92%]" />
                <SkeletonBar className="h-3 w-[80%]" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex -space-x-2">
                  <SkeletonCircle className="h-6 w-6 ring-2 ring-card-bg" />
                  <SkeletonCircle className="h-6 w-6 ring-2 ring-card-bg" />
                  <SkeletonCircle className="h-6 w-6 ring-2 ring-card-bg" />
                </div>
                <SkeletonPill className="w-20" />
                <SkeletonPill className="w-16" />
                <SkeletonPill className="w-24" />
              </div>

              <div className="space-y-3 border-t border-border-color pt-5">
                <SkeletonBar className="h-3 w-28" />
                <SkeletonBlock className="h-16 w-full rounded-md" />
                <SkeletonBlock className="h-16 w-full rounded-md" />
              </div>

              <div className="space-y-3 border-t border-border-color pt-5">
                <SkeletonBar className="h-3 w-24" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-12 w-full rounded-md" />
                  <SkeletonBlock className="h-12 w-[90%] rounded-md" />
                  <SkeletonBlock className="h-12 w-[95%] rounded-md" />
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-md border border-border-color bg-card-bg p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <SkeletonBar className="h-3.5 w-28" />
              <SkeletonBar className="h-7 w-24 rounded-md" />
            </div>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex gap-3">
                <SkeletonCircle className="h-8 w-8" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBar className="h-2.5 w-28" />
                  <SkeletonBlock
                    className={cn(
                      "rounded-md",
                      index % 2 === 0 ? "h-14 w-full" : "h-10 w-[85%]",
                    )}
                  />
                </div>
              </div>
            ))}
            <div className="border-t border-border-color pt-4">
              <SkeletonBlock className="h-20 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
