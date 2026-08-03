export function DiscardDraftBanner({
  onKeep,
  onDiscard,
}: {
  onKeep: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-warning/10 px-3 py-2 text-[12px]">
      <span className="text-foreground">Discard draft?</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onKeep}
          className="rounded border border-border px-2 py-0.5 font-medium hover:bg-surface"
        >
          Keep editing
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="rounded bg-destructive px-2 py-0.5 font-medium text-destructive-foreground"
        >
          Discard
        </button>
      </div>
    </div>
  );
}
