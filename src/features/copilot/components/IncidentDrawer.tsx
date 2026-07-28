import { Drawer } from "@/shared/components/copilot";
import type { Customer, Issue, Property } from "@/shared/types";
import { IncidentForm } from "./IncidentForm";
import type { FormState } from "./incident-form.types";

export { emptyForm, type FormState } from "./incident-form.types";

export function IncidentDrawer({
  open,
  onClose,
  form,
  setForm,
  onClear,
  onSubmit,
  customer,
  property,
  issue,
}: {
  open: boolean;
  onClose: () => void;
  form: FormState;
  setForm: (f: FormState) => void;
  onClear: () => void;
  onSubmit: () => void;
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
}) {
  return (
    <Drawer open={open} onClose={onClose} title="Incident Details" subtitle="" badge={undefined}>
      <IncidentForm
        form={form}
        setForm={setForm}
        onClear={onClear}
        onSubmit={onSubmit}
        customer={customer}
        property={property}
        issue={issue}
      />
    </Drawer>
  );
}
