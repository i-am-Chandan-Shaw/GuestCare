import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCustomerById } from "@/features/directory/api/customers.api";
import {
  createProtocol,
  getProtocolById,
  updateProtocol,
} from "@/features/directory/api/protocols.api";
import { DirectoryFormSkeleton } from "@/features/directory/components/DirectoryFormSkeleton";
import { DirectoryWizardDialog } from "@/features/directory/components/DirectoryWizardDialog";
import { DynamicOrderedList } from "@/features/directory/components/DynamicOrderedList";
import { EscalationField } from "@/features/directory/components/EscalationField";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import {
  PRIORITY_CATEGORIES,
  priorityFromCategory,
  type PriorityCategory,
} from "@/features/directory/lib/priority-from-category";
import { RESERVATION_VERIFICATIONS } from "@/features/directory/validations/protocol-form.schema";
import { Input, Select } from "@/shared/components/FloatingLabelField";
import type { CustomerContact, EscalationKind, OrderedStepItem } from "@/shared/types";

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "escalation", label: "Escalation" },
] as const;

type EscalationMode = "contact" | "preset";

type ProtocolFieldErrors = {
  category?: string;
  name?: string;
  customerContactId?: string;
  escalation?: string;
};

type FormState = {
  category: string;
  name: string;
  reservationVerification: (typeof RESERVATION_VERIFICATIONS)[number];
  priorityCategory: PriorityCategory;
  steps: OrderedStepItem[];
  escalationMode: EscalationMode;
  customerContactId: string;
  escalation?: EscalationKind;
};

const emptyForm = (): FormState => ({
  category: "",
  name: "",
  reservationVerification: "Required",
  priorityCategory: "Inconvenient but Not Critical",
  steps: [],
  escalationMode: "preset",
  customerContactId: "",
  escalation: "host",
});

function kindFromStored(
  kind: string | undefined,
  details: string | undefined,
): EscalationKind | undefined {
  if (!kind) return undefined;
  if (kind === "custom") return { custom: details ?? "" };
  if (
    kind === "host" ||
    kind === "emergency-then-host" ||
    kind === "next-day-followup" ||
    kind === "cleaning"
  ) {
    return kind;
  }
  return undefined;
}

function contactLabel(contact: CustomerContact) {
  const name = contact.name.trim() || contact.label.trim() || "Contact";
  const phone = contact.phone.trim();
  return phone ? `${name} · ${phone}` : name;
}

export function ProtocolFormDialog({
  open,
  mode,
  customerId,
  propertyId,
  protocolId,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  customerId: string;
  propertyId: string;
  protocolId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<ProtocolFieldErrors>({});
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    setErrors({});

    let cancelled = false;
    setHydrating(true);

    const load = async () => {
      const customer = await getCustomerById(customerId);
      if (cancelled) return;
      setContacts(customer.contacts);

      if (mode === "create" || !protocolId) {
        setForm({
          ...emptyForm(),
          escalationMode: customer.contacts.length > 0 ? "contact" : "preset",
          customerContactId: customer.contacts[0]?.id ?? "",
          escalation: "host",
        });
        return;
      }

      const protocol = await getProtocolById(protocolId);
      if (cancelled) return;

      const hasContact = Boolean(protocol.customerContactId);
      setForm({
        category: protocol.category,
        name: protocol.name,
        reservationVerification: protocol.reservationVerification,
        priorityCategory: protocol.priorityCategory,
        steps: protocol.steps,
        escalationMode: hasContact ? "contact" : "preset",
        customerContactId: protocol.customerContactId ?? customer.contacts[0]?.id ?? "",
        escalation: hasContact
          ? undefined
          : kindFromStored(protocol.escalationKind, protocol.escalationDetails),
      });
    };

    void load()
      .catch((error) => {
        if (cancelled) return;
        toast.error(getClientErrorMessage(error, "Failed to load protocol."));
        onOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, mode, customerId, protocolId, onOpenChange]);

  const patch = (partial: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(partial) as (keyof FormState)[]) {
        if (key in next) delete next[key as keyof ProtocolFieldErrors];
      }
      return next;
    });
  };

  const derivedPriority = priorityFromCategory(form.priorityCategory);

  const validateBasics = () => {
    const nextErrors: ProtocolFieldErrors = {};
    if (!form.category.trim()) nextErrors.category = "Category is required";
    if (!form.name.trim()) nextErrors.name = "Name is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setActiveIndex(0);
      return false;
    }
    return true;
  };

  const validateEscalation = () => {
    // Escalation is optional — incomplete protocols can be saved and filled later.
    setErrors((prev) => {
      const next = { ...prev };
      delete next.customerContactId;
      delete next.escalation;
      return next;
    });
    return true;
  };

  const validateStep = () => {
    if (hydrating) return false;
    if (activeIndex === 0) return validateBasics();
    if (activeIndex === 2) {
      if (!validateBasics()) return false;
      return validateEscalation();
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const escalationKind =
        form.escalationMode === "preset"
          ? form.escalation && typeof form.escalation === "object"
            ? ("custom" as const)
            : (form.escalation ?? null)
          : null;
      const escalationDetails =
        form.escalationMode === "preset" &&
        form.escalation &&
        typeof form.escalation === "object"
          ? form.escalation.custom
          : undefined;

      const payload = {
        propertyId,
        category: form.category,
        name: form.name,
        reservationVerification: form.reservationVerification,
        priorityCategory: form.priorityCategory,
        steps: form.steps.map((step, position) => ({
          id: step.id,
          label: step.label,
          hint: step.hint,
          position,
        })),
        customerContactId:
          form.escalationMode === "contact" && form.customerContactId
            ? form.customerContactId
            : null,
        escalationKind,
        escalationDetails,
      };

      if (mode === "edit" && protocolId) {
        await updateProtocol({ id: protocolId, ...payload });
        toast.success("Protocol updated.");
      } else {
        await createProtocol(payload);
        toast.success("Protocol created.");
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to save protocol."));
    } finally {
      setLoading(false);
    }
  };

  const contactOptions = contacts.map((contact) => contact.id);
  const contactLabels = Object.fromEntries(
    contacts.map((contact) => [contact.id, contactLabel(contact)]),
  );

  return (
    <DirectoryWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Add protocol" : "Edit protocol"}
      description={
        mode === "create"
          ? "Add a protocol with troubleshooting steps and escalation."
          : "Update this protocol’s directory details."
      }
      mode={mode}
      steps={[...STEPS]}
      activeIndex={activeIndex}
      onActiveIndexChange={(index) => {
        setErrors({});
        setActiveIndex(index);
      }}
      onValidateStep={validateStep}
      onSubmit={() => void handleSubmit()}
      submitLabel={mode === "create" ? "Create protocol" : "Save changes"}
      loading={loading || hydrating}
    >
      {hydrating ? <DirectoryFormSkeleton rows={4} /> : null}

      {!hydrating && activeIndex === 0 ? (
        <div className="space-y-4">
          <Input
            label="Category"
            value={form.category}
            onChange={(category) => patch({ category })}
            error={errors.category}
          />
          <Input
            label="Name"
            value={form.name}
            onChange={(name) => patch({ name })}
            error={errors.name}
          />
          <Select
            label="Reservation verification"
            value={form.reservationVerification}
            options={[...RESERVATION_VERIFICATIONS]}
            onChange={(reservationVerification) =>
              patch({
                reservationVerification:
                  reservationVerification as FormState["reservationVerification"],
              })
            }
          />
          <Select
            label="Priority category"
            value={form.priorityCategory}
            options={[...PRIORITY_CATEGORIES]}
            onChange={(priorityCategory) =>
              patch({ priorityCategory: priorityCategory as PriorityCategory })
            }
          />
          <p className="text-[12px] text-text-muted">
            Priority on save: <span className="font-semibold text-text-primary">{derivedPriority}</span>
          </p>
        </div>
      ) : null}

      {!hydrating && activeIndex === 1 ? (
        <DynamicOrderedList
          items={form.steps}
          onChange={(items) =>
            patch({
              steps: items.map((item, position) => ({
                id: item.id,
                label: item.label,
                hint: item.hint,
                position,
              })),
            })
          }
          labelPlaceholder="Troubleshooting step"
          showHint
          hintPlaceholder="Details (optional)"
          addLabel="Add step"
          emptyMessage="No troubleshooting steps yet."
        />
      ) : null}

      {!hydrating && activeIndex === 2 ? (
        <div className="space-y-4">
          <Select
            label="Escalation type"
            value={form.escalationMode}
            options={["contact", "preset"]}
            optionLabels={{
              contact: "Customer contact",
              preset: "Preset / custom",
            }}
            onChange={(escalationMode) =>
              patch({
                escalationMode: escalationMode as EscalationMode,
                customerContactId:
                  escalationMode === "contact"
                    ? form.customerContactId || contacts[0]?.id || ""
                    : "",
                escalation: escalationMode === "preset" ? (form.escalation ?? "host") : form.escalation,
              })
            }
          />

          {form.escalationMode === "contact" ? (
            contacts.length === 0 ? (
              <div className="space-y-1.5">
                <p className="text-[13px] text-text-secondary">
                  This customer has no contacts yet. Switch to preset/custom, or add contacts on the
                  customer.
                </p>
                {errors.customerContactId ? (
                  <p className="text-[11px] leading-snug text-destructive" role="alert">
                    {errors.customerContactId}
                  </p>
                ) : null}
              </div>
            ) : (
              <Select
                label="Contact"
                value={form.customerContactId}
                options={contactOptions}
                optionLabels={contactLabels}
                onChange={(customerContactId) => patch({ customerContactId })}
                error={errors.customerContactId}
              />
            )
          ) : (
            <EscalationField
              value={form.escalation}
              onChange={(escalation) => patch({ escalation })}
              error={errors.escalation}
            />
          )}
        </div>
      ) : null}
    </DirectoryWizardDialog>
  );
}
