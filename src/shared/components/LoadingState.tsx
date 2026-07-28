export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center rounded-sm border border-dashed border-border bg-card p-10 text-[13px] text-muted-foreground">
      {label}
    </div>
  );
}
