export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-border-color bg-app-bg p-10 text-[13px] text-text-secondary">
      <span className="inline-flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        {label}
      </span>
    </div>
  );
}
