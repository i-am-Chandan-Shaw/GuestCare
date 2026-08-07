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

function CustomerRowSkeleton({ striped }: { striped?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-4 px-4 py-3.5",
        striped ? "bg-grid-header-bg/40" : undefined,
      )}
    >
      <div className="flex min-w-0 w-[240px] shrink-0 items-center gap-3 border-r border-border-color pr-4">
        <SkeletonCircle className="h-11 w-11" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBar className="h-3.5 w-[70%]" />
          <SkeletonBar className="h-2.5 w-[55%]" />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-stretch gap-4 pl-4">
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBar className="h-2 w-16" />
          <SkeletonBar className="h-4 w-8" />
        </div>
        <div className="min-w-0 flex-1 space-y-2 border-l border-border-color pl-4">
          <SkeletonBar className="h-2 w-14" />
          <SkeletonBar className="h-4 w-8" />
        </div>
        <div className="min-w-0 flex-1 space-y-2 border-l border-border-color pl-4">
          <SkeletonBar className="h-2 w-16" />
          <SkeletonBar className="h-4 w-8" />
        </div>
        <div className="min-w-0 flex-[1.2] space-y-2 border-l border-border-color pl-4">
          <SkeletonBar className="h-2 w-20" />
          <SkeletonBar className="h-3 w-[80%]" />
        </div>
      </div>
      <SkeletonBar className="ml-2 h-4 w-4 shrink-0 rounded" />
    </div>
  );
}

function PropertyRowSkeleton({ striped }: { striped?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-4 px-4 py-3.5",
        striped ? "bg-grid-header-bg/40" : undefined,
      )}
    >
      <SkeletonBlock className="h-[56px] w-[84px] shrink-0 rounded-md" />
      <div className="min-w-0 w-[200px] shrink-0 space-y-2 border-r border-border-color pr-4">
        <SkeletonBar className="h-3.5 w-[75%]" />
        <SkeletonBar className="h-2.5 w-[90%]" />
      </div>
      <div className="flex min-w-0 flex-1 items-stretch gap-4 pl-4">
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBar className="h-2 w-16" />
          <SkeletonBar className="h-4 w-8" />
        </div>
        <div className="min-w-0 flex-1 space-y-2 border-l border-border-color pl-4">
          <SkeletonBar className="h-2 w-14" />
          <SkeletonBar className="h-4 w-8" />
        </div>
        <div className="min-w-0 flex-1 space-y-2 border-l border-border-color pl-4">
          <SkeletonBar className="h-2 w-16" />
          <SkeletonBar className="h-4 w-8" />
        </div>
      </div>
      <SkeletonBar className="ml-2 h-4 w-4 shrink-0 rounded" />
    </div>
  );
}

export function CustomerListSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border-color" aria-busy="true" aria-label="Loading customers">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index}>
          <CustomerRowSkeleton striped={index % 2 === 1} />
        </li>
      ))}
    </ul>
  );
}

export function PropertyListSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border-color" aria-busy="true" aria-label="Loading properties">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index}>
          <PropertyRowSkeleton striped={index % 2 === 1} />
        </li>
      ))}
    </ul>
  );
}

export function IssueListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading issues">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="rounded-md border border-border bg-surface/60 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <SkeletonBar className={cn("h-3.5", index % 2 === 0 ? "w-[65%]" : "w-[50%]")} />
            <SkeletonBlock className="h-5 w-12 shrink-0 rounded-full" />
          </div>
          <SkeletonBar className="mt-2 h-2.5 w-[40%]" />
        </div>
      ))}
    </div>
  );
}

export function HistoryListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="relative" aria-busy="true" aria-label="Loading report history">
      <span className="absolute bottom-3 left-[13px] top-3 z-0 w-px bg-border-color" aria-hidden />
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="relative flex gap-3 pb-5 last:pb-0">
          <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center">
            <SkeletonCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <div className="flex h-7 items-center justify-between gap-2">
              <SkeletonBar className="h-2.5 w-24" />
              <SkeletonBlock className="h-5 w-14 shrink-0 rounded" />
            </div>
            <SkeletonBar className={cn("h-3.5", index % 2 === 0 ? "w-[85%]" : "w-[70%]")} />
            <SkeletonBar className="h-2.5 w-[45%]" />
            <SkeletonBar className="mt-1 h-2.5 w-28" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function WorkspaceHeaderSkeleton({ crumbs }: { crumbs: number }) {
  return (
    <div className="shrink-0 border-b border-border-color bg-white px-5 py-2.5">
      <SkeletonBar className="h-4 w-28" />
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {Array.from({ length: crumbs }, (_, index) => (
          <SkeletonBlock
            key={index}
            className={cn("h-8 rounded-md", index === 0 ? "w-36" : index === 1 ? "w-40" : "w-44")}
          />
        ))}
      </div>
    </div>
  );
}

function ProtocolLayoutSkeleton() {
  return (
    <main className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)]">
      <div className="min-h-0 space-y-3 overflow-hidden border-r border-border bg-surface/60 p-4">
        <SkeletonBlock className="h-40 w-full rounded-xl" />
        <SkeletonBlock className="h-9 w-full rounded-lg" />
        <div className="space-y-3 pt-1">
          <SkeletonBlock className="h-24 w-full rounded-md" />
          <SkeletonBlock className="h-28 w-full rounded-md" />
          <SkeletonBlock className="h-20 w-full rounded-md" />
        </div>
      </div>
      <div className="min-h-0 overflow-hidden bg-background p-6">
        <div className="mx-auto max-w-[850px] space-y-5">
          <div className="space-y-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <SkeletonBar className="h-6 w-56" />
              <SkeletonBlock className="h-6 w-16 rounded-md" />
            </div>
            <SkeletonBar className="h-3 w-72" />
            <div className="flex gap-4 pt-1">
              <SkeletonBar className="h-3 w-16" />
              <SkeletonBar className="h-3 w-20" />
              <SkeletonBar className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-3">
            <SkeletonBlock className="h-16 w-full rounded-md" />
            <SkeletonBlock className="h-16 w-full rounded-md" />
            <SkeletonBlock className="h-16 w-full rounded-md" />
            <SkeletonBlock className="h-16 w-full rounded-md" />
          </div>
        </div>
      </div>
    </main>
  );
}

function PropertyBrowseLayoutSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 gap-4 overflow-hidden bg-app-bg p-4">
      <div className="flex min-h-0 min-w-0 flex-[7] flex-col overflow-hidden rounded-md border border-border-color bg-card-bg">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-color px-4 py-3">
          <div className="flex items-center gap-2">
            <SkeletonCircle className="h-7 w-7" />
            <SkeletonBar className="h-4 w-40" />
          </div>
          <SkeletonBlock className="h-9 w-56 rounded-md" />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <PropertyListSkeleton rows={6} />
        </div>
      </div>
      <div className="flex min-h-0 w-[320px] shrink-0 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg p-4">
        <SkeletonBar className="mb-4 h-4 w-28" />
        <HistoryListSkeleton rows={4} />
      </div>
    </div>
  );
}

/**
 * Full-page skeleton while URL-driven workspace selection is restored.
 * Matches property browse vs protocol layout based on deep-link depth.
 */
export function WorkspaceRestoreSkeleton({
  hasProperty,
  hasIssue,
}: {
  hasProperty?: boolean;
  hasIssue?: boolean;
}) {
  const crumbs = hasIssue ? 3 : hasProperty ? 2 : 1;
  const showProtocol = Boolean(hasProperty || hasIssue);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-busy="true"
      aria-label="Restoring workspace"
    >
      <WorkspaceHeaderSkeleton crumbs={crumbs} />
      {showProtocol ? <ProtocolLayoutSkeleton /> : <PropertyBrowseLayoutSkeleton />}
    </div>
  );
}
