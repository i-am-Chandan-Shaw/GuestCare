import { AlertCircle } from "lucide-react";

export function QueryErrorState({
  message = "Something went wrong loading data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border bg-card p-8 text-center">
      <AlertCircle className="h-6 w-6 text-muted-foreground" />
      <p className="text-[13px] text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-foreground hover:bg-surface-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
