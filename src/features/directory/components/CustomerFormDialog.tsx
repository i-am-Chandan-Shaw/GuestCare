import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createCustomer,
  getCustomerById,
  updateCustomer,
} from "@/features/directory/api/customers.api";
import { CustomerContactsEditor } from "@/features/directory/components/CustomerContactsEditor";
import { DirectoryFormSkeleton } from "@/features/directory/components/DirectoryFormSkeleton";
import { DirectoryWizardDialog } from "@/features/directory/components/DirectoryWizardDialog";
import { DynamicOrderedList } from "@/features/directory/components/DynamicOrderedList";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import type { CustomerContact, OrderedStepItem } from "@/shared/types";
import { Input, Phone, usePasswordEndAction } from "@/shared/components/FloatingLabelField";

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "contacts", label: "Contacts" },
  { id: "pms", label: "PMS" },
  { id: "verification", label: "Verification" },
] as const;

type FormState = {
  name: string;
  email: string;
  phone: string;
  pmsUrl: string;
  pmsUsername: string;
  pmsPassword: string;
  contacts: CustomerContact[];
  guestVerificationSteps: OrderedStepItem[];
};

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

const emptyForm = (): FormState => ({
  name: "",
  email: "",
  phone: "",
  pmsUrl: "",
  pmsUsername: "",
  pmsPassword: "",
  contacts: [],
  guestVerificationSteps: [],
});

function isValidEmail(value: string) {
  return value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function CustomerFormDialog({
  open,
  mode,
  customerId,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  customerId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [phoneValid, setPhoneValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordEndAction = usePasswordEndAction(showPassword, () =>
    setShowPassword((prev) => !prev),
  );

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    setShowPassword(false);
    setErrors({});
    setPhoneValid(true);

    if (mode === "create" || !customerId) {
      setForm(emptyForm());
      return;
    }

    let cancelled = false;
    setHydrating(true);
    void getCustomerById(customerId)
      .then((customer) => {
        if (cancelled) return;
        setForm({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          pmsUrl: customer.pms.url ?? "",
          pmsUsername: customer.pms.username ?? "",
          pmsPassword: customer.pms.password ?? "",
          contacts: customer.contacts,
          guestVerificationSteps: customer.guestVerificationSteps,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getClientErrorMessage(error, "Failed to load customer."));
        onOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, mode, customerId, onOpenChange]);

  const patch = (partial: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(partial) as (keyof FormState)[]) {
        if (key in next) delete next[key as keyof FieldErrors];
      }
      return next;
    });
  };

  const validateBasics = () => {
    const nextErrors: FieldErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!isValidEmail(form.email.trim())) nextErrors.email = "Enter a valid email";
    if (form.phone.trim() && !phoneValid) nextErrors.phone = "Enter a valid phone number";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setActiveIndex(0);
      return false;
    }
    return true;
  };

  const validateStep = () => {
    if (hydrating) return false;
    // Basics gate for step 0 (Next) and final submit (last step).
    if (activeIndex === 0 || activeIndex === STEPS.length - 1) {
      return validateBasics();
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        pmsUrl: form.pmsUrl,
        pmsUsername: form.pmsUsername,
        pmsPassword: form.pmsPassword,
        contacts: form.contacts.map((contact, position) => ({ ...contact, position })),
        guestVerificationSteps: form.guestVerificationSteps.map((step, position) => ({
          ...step,
          position,
        })),
      };

      if (mode === "edit" && customerId) {
        await updateCustomer({ id: customerId, ...payload });
        toast.success("Customer updated.");
      } else {
        await createCustomer(payload);
        toast.success("Customer created.");
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to save customer."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DirectoryWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Add customer" : "Edit customer"}
      description={
        mode === "create"
          ? "Add a customer with contacts, PMS access, and guest verification steps."
          : "Update this customer’s directory details."
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
      submitLabel={mode === "create" ? "Create customer" : "Save changes"}
      loading={loading || hydrating}
    >
      {hydrating ? <DirectoryFormSkeleton rows={3} /> : null}

      {!hydrating && activeIndex === 0 ? (
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(name) => patch({ name })}
            error={errors.name}
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(email) => patch({ email })}
            error={errors.email}
          />
          <Phone
            label="Phone"
            value={form.phone}
            onChange={(phone) => patch({ phone })}
            onValidityChange={setPhoneValid}
            error={errors.phone}
          />
        </div>
      ) : null}

      {!hydrating && activeIndex === 1 ? (
        <CustomerContactsEditor
          contacts={form.contacts}
          onChange={(contacts) => patch({ contacts })}
        />
      ) : null}

      {!hydrating && activeIndex === 2 ? (
        <div className="space-y-4">
          <Input label="PMS link" value={form.pmsUrl} onChange={(pmsUrl) => patch({ pmsUrl })} />
          <Input
            label="Username"
            value={form.pmsUsername}
            onChange={(pmsUsername) => patch({ pmsUsername })}
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            value={form.pmsPassword}
            onChange={(pmsPassword) => patch({ pmsPassword })}
            endAction={passwordEndAction}
          />
        </div>
      ) : null}

      {!hydrating && activeIndex === 3 ? (
        <DynamicOrderedList
          items={form.guestVerificationSteps}
          onChange={(items) =>
            patch({
              guestVerificationSteps: items.map((item, position) => ({
                id: item.id,
                label: item.label,
                position,
              })),
            })
          }
          labelPlaceholder="Verification step"
          addLabel="Add step"
          emptyMessage="No verification steps yet."
        />
      ) : null}
    </DirectoryWizardDialog>
  );
}
