import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Phone } from "@/shared/components/FloatingLabelField";
import type { CustomerContact } from "@/shared/types";

export function CustomerContactsEditor({
  contacts,
  onChange,
}: {
  contacts: CustomerContact[];
  onChange: (contacts: CustomerContact[]) => void;
}) {
  const updateAt = (index: number, patch: Partial<CustomerContact>) => {
    onChange(contacts.map((contact, i) => (i === index ? { ...contact, ...patch } : contact)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= contacts.length) return;
    const copy = [...contacts];
    const [row] = copy.splice(index, 1);
    copy.splice(next, 0, row);
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {contacts.length === 0 ? (
        <p className="text-[13px] text-text-muted">No contacts yet.</p>
      ) : (
        contacts.map((contact, index) => (
          <div
            key={contact.id}
            className="space-y-2 rounded-lg border border-border-color bg-app-bg/40 p-3"
          >
            <div className="flex items-start gap-2">
              <span className="mt-3 w-6 shrink-0 text-center text-[12px] font-semibold text-text-muted">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <Input
                  label="Team / label"
                  value={contact.label}
                  onChange={(value) => updateAt(index, { label: value })}
                />
                <Input
                  label="Name"
                  value={contact.name}
                  onChange={(value) => updateAt(index, { name: value })}
                />
                <Phone
                  label="Phone"
                  value={contact.phone}
                  onChange={(value) => updateAt(index, { phone: value })}
                />
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
                  disabled={index === contacts.length - 1}
                  aria-label="Move down"
                  title="Move down"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-white hover:text-text-primary disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(contacts.filter((_, i) => i !== index))}
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
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          onChange([
            ...contacts,
            {
              id: crypto.randomUUID(),
              label: "",
              name: "",
              phone: "",
              position: contacts.length,
            },
          ])
        }
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
        Add contact
      </Button>
    </div>
  );
}
