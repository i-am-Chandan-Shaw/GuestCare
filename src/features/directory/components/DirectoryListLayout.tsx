import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Plus } from "lucide-react";

export function DirectoryListLayout({
  title,
  subtitle,
  backLabel,
  onBack,
  addLabel,
  onAdd,
  toolbar,
  children,
}: {
  title?: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
  addLabel?: string;
  onAdd?: () => void;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border-color bg-white/80 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label={backLabel ?? "Go back"}
                title={backLabel ?? "Go back"}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-app-bg text-text-secondary transition-colors hover:bg-border-color hover:text-text-primary"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
            ) : null}
            <div className="min-w-0">
              {title ? (
                <h1 className="truncate text-lg font-black uppercase tracking-tight text-text-primary">
                  {title}
                </h1>
              ) : null}
              {subtitle ? (
                <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          {addLabel && onAdd ? (
            <Button type="button" size="sm" onClick={onAdd} className="shrink-0">
              <Plus className="h-4 w-4" strokeWidth={2} />
              {addLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {toolbar ? <div className="shrink-0 bg-app-bg px-5 pt-3 pb-4">{toolbar}</div> : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
