import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/shared/components/FloatingLabelField";

export type DynamicOrderedItem = {
  id: string;
  label: string;
  hint?: string;
};

export function DynamicOrderedList({
  items,
  onChange,
  labelPlaceholder = "Label",
  showHint = false,
  hintPlaceholder = "Details (optional)",
  addLabel = "Add item",
  emptyMessage = "No items yet.",
}: {
  items: DynamicOrderedItem[];
  onChange: (items: DynamicOrderedItem[]) => void;
  labelPlaceholder?: string;
  showHint?: boolean;
  hintPlaceholder?: string;
  addLabel?: string;
  emptyMessage?: string;
}) {
  const updateAt = (index: number, patch: Partial<DynamicOrderedItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    const [row] = copy.splice(index, 1);
    copy.splice(next, 0, row);
    onChange(copy);
  };

  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        label: "",
        ...(showHint ? { hint: "" } : {}),
      },
    ]);
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-[13px] text-text-muted">{emptyMessage}</p>
      ) : (
        items.map((item, index) => (
          <div
            key={item.id}
            className="space-y-2 rounded-lg border border-border-color bg-app-bg/40 p-3"
          >
            <div className="flex items-start gap-2">
              <span className="mt-3 w-6 shrink-0 text-center text-[12px] font-semibold text-text-muted">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <Input
                  label={labelPlaceholder}
                  value={item.label}
                  onChange={(value) => updateAt(index, { label: value })}
                />
                {showHint ? (
                  <Textarea
                    label={hintPlaceholder}
                    value={item.hint ?? ""}
                    onChange={(value) => updateAt(index, { hint: value })}
                  />
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  title="Move up"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-white hover:text-text-primary disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  title="Move down"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-white hover:text-text-primary disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label="Remove"
                  title="Remove"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-white hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
      <Button type="button" variant="secondary" size="sm" onClick={addItem}>
        <Plus className="h-4 w-4" strokeWidth={2} />
        {addLabel}
      </Button>
    </div>
  );
}
