import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/shared/components/FloatingLabelField";

export type DynamicOrderedItem = {
  id: string;
  label: string;
  hint?: string;
};

function SortableRow({
  item,
  index,
  labelPlaceholder,
  onLabelChange,
  onRemove,
}: {
  item: DynamicOrderedItem;
  index: number;
  labelPlaceholder: string;
  onLabelChange: (value: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-start gap-2 rounded-lg border border-border-color bg-app-bg/40 p-3 ${
        isDragging ? "z-10 border-brand-primary/40 bg-card-bg shadow-md" : ""
      }`}
    >
      <button
        type="button"
        className="mt-2.5 inline-flex h-8 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-text-muted transition-colors hover:bg-white hover:text-text-primary active:cursor-grabbing"
        aria-label={`Drag to reorder step ${index + 1}`}
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" strokeWidth={2} />
      </button>
      <span className="mt-3 w-5 shrink-0 text-center text-[12px] font-semibold text-text-muted">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <Input label={labelPlaceholder} value={item.label} onChange={onLabelChange} />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        title="Remove"
        className="mt-2.5 inline-flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-white hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

export function DynamicOrderedList({
  items,
  onChange,
  labelPlaceholder = "Label",
  addLabel = "Add item",
  emptyMessage = "No items yet.",
}: {
  items: DynamicOrderedItem[];
  onChange: (items: DynamicOrderedItem[]) => void;
  labelPlaceholder?: string;
  addLabel?: string;
  emptyMessage?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const updateAt = (index: number, patch: Partial<DynamicOrderedItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
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
      },
    ]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-[13px] text-text-muted">{emptyMessage}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item, index) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  index={index}
                  labelPlaceholder={labelPlaceholder}
                  onLabelChange={(value) => updateAt(index, { label: value })}
                  onRemove={() => removeAt(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <Button type="button" variant="secondary" size="sm" onClick={addItem}>
        <Plus className="h-4 w-4" strokeWidth={2} />
        {addLabel}
      </Button>
    </div>
  );
}
