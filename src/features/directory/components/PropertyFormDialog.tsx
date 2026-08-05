import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createProperty,
  getPropertyById,
  updateProperty,
} from "@/features/directory/api/properties.api";
import { DirectoryWizardDialog } from "@/features/directory/components/DirectoryWizardDialog";
import { DynamicOrderedList } from "@/features/directory/components/DynamicOrderedList";
import { EscalationField } from "@/features/directory/components/EscalationField";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import { SYSTEM_KEYS } from "@/features/directory/validations/property-form.schema";
import { Input, Textarea } from "@/shared/components/FloatingLabelField";
import { SYSTEM_LABELS } from "@/shared/constants/system-labels";
import type { EscalationKind, SystemInfo, SystemKey } from "@/shared/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "stay", label: "Stay" },
  { id: "connectivity", label: "Connectivity" },
  { id: "house", label: "House & amenities" },
  { id: "systems", label: "Systems" },
] as const;

type HouseRuleItem = { id: string; label: string };

type FormState = {
  name: string;
  type: string;
  maxGuests: string;
  buildingNumber: string;
  unit: string;
  address: string;
  postalCode: string;
  area: string;
  floor: string;
  guideUrl: string;
  listingUrl: string;
  mediaFolderUrl: string;
  imageUrl: string;
  specificInfo: string;
  checkInTime: string;
  checkInInstructions: string;
  checkOutTime: string;
  checkOutInstructions: string;
  spareKeys: string;
  parking: string;
  wifiLocation: string;
  wifiNetwork: string;
  wifiPassword: string;
  houseRules: HouseRuleItem[];
  laundry: string;
  laundryEscalation?: EscalationKind;
  waste: string;
  lockboxCode: string;
  keyNest: string;
  doorCode: string;
  accessNotes: string;
  enabledSystems: SystemKey[];
  systems: Partial<Record<SystemKey, SystemInfo>>;
};

const emptyForm = (): FormState => ({
  name: "",
  type: "",
  maxGuests: "",
  buildingNumber: "",
  unit: "",
  address: "",
  postalCode: "",
  area: "",
  floor: "",
  guideUrl: "",
  listingUrl: "",
  mediaFolderUrl: "",
  imageUrl: "",
  specificInfo: "",
  checkInTime: "",
  checkInInstructions: "",
  checkOutTime: "",
  checkOutInstructions: "",
  spareKeys: "",
  parking: "",
  wifiLocation: "",
  wifiNetwork: "",
  wifiPassword: "",
  houseRules: [],
  laundry: "",
  laundryEscalation: undefined,
  waste: "",
  lockboxCode: "",
  keyNest: "",
  doorCode: "",
  accessNotes: "",
  enabledSystems: [],
  systems: {},
});

function parseMaxGuests(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function PropertyFormDialog({
  open,
  mode,
  customerId,
  propertyId,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  customerId: string;
  propertyId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);

    if (mode === "create" || !propertyId) {
      setForm(emptyForm());
      return;
    }

    let cancelled = false;
    setHydrating(true);
    void getPropertyById(propertyId)
      .then((property) => {
        if (cancelled) return;
        const enabledSystems = SYSTEM_KEYS.filter((key) => property.systems[key]);
        setForm({
          name: property.name,
          type: property.type,
          maxGuests: property.maxGuests != null ? String(property.maxGuests) : "",
          buildingNumber: property.buildingNumber ?? "",
          unit: property.unit ?? "",
          address: property.address,
          postalCode: property.postalCode ?? "",
          area: property.area ?? "",
          floor: property.floor ?? "",
          guideUrl: property.guideUrl ?? "",
          listingUrl: property.listingUrl ?? "",
          mediaFolderUrl: property.mediaFolderUrl ?? "",
          imageUrl: property.imageUrl ?? "",
          specificInfo: property.specificInfo,
          checkInTime: property.checkIn.time,
          checkInInstructions: property.checkIn.instructions,
          checkOutTime: property.checkOut.time,
          checkOutInstructions: property.checkOut.instructions,
          spareKeys: property.spareKeys ?? "",
          parking: property.parking ?? "",
          wifiLocation: property.wifi.location ?? "",
          wifiNetwork: property.wifi.network ?? "",
          wifiPassword: property.wifi.password ?? "",
          houseRules: property.houseRules.map((label) => ({
            id: crypto.randomUUID(),
            label,
          })),
          laundry: property.laundry ?? "",
          laundryEscalation: property.laundryEscalation,
          waste: property.waste ?? "",
          lockboxCode: property.accessSummary?.lockboxCode ?? "",
          keyNest: property.accessSummary?.keyNest ?? "",
          doorCode: property.accessSummary?.doorCode ?? "",
          accessNotes: property.accessSummary?.accessNotes ?? "",
          enabledSystems,
          systems: property.systems,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getClientErrorMessage(error, "Failed to load property."));
        onOpenChange(false);
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, mode, propertyId, onOpenChange]);

  const patch = (partial: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const maxGuestsValid =
    form.maxGuests.trim() === "" || parseMaxGuests(form.maxGuests) !== undefined;

  const canProceed =
    activeIndex === 0
      ? form.name.trim().length > 0 && form.type.trim().length > 0 && maxGuestsValid
      : true;

  const toggleSystem = (key: SystemKey, enabled: boolean) => {
    setForm((prev) => {
      const enabledSystems = enabled
        ? prev.enabledSystems.includes(key)
          ? prev.enabledSystems
          : [...prev.enabledSystems, key]
        : prev.enabledSystems.filter((item) => item !== key);

      const systems = { ...prev.systems };
      if (enabled) {
        systems[key] = systems[key] ?? {};
      } else {
        delete systems[key];
      }

      return { ...prev, enabledSystems, systems };
    });
  };

  const patchSystem = (key: SystemKey, next: SystemInfo) => {
    setForm((prev) => ({
      ...prev,
      systems: { ...prev.systems, [key]: next },
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.type.trim() || !maxGuestsValid) {
      setActiveIndex(0);
      return;
    }

    setLoading(true);
    try {
      const systems: Partial<Record<SystemKey, SystemInfo>> = {};
      for (const key of form.enabledSystems) {
        const value = form.systems[key];
        if (value) systems[key] = value;
      }

      const payload = {
        customerId,
        name: form.name,
        type: form.type,
        maxGuests: parseMaxGuests(form.maxGuests),
        buildingNumber: form.buildingNumber,
        unit: form.unit,
        address: form.address,
        postalCode: form.postalCode,
        area: form.area,
        floor: form.floor,
        guideUrl: form.guideUrl,
        listingUrl: form.listingUrl,
        mediaFolderUrl: form.mediaFolderUrl,
        imageUrl: form.imageUrl,
        specificInfo: form.specificInfo,
        checkInTime: form.checkInTime,
        checkInInstructions: form.checkInInstructions,
        checkOutTime: form.checkOutTime,
        checkOutInstructions: form.checkOutInstructions,
        spareKeys: form.spareKeys,
        parking: form.parking,
        wifi: {
          location: form.wifiLocation,
          network: form.wifiNetwork,
          password: form.wifiPassword,
        },
        houseRules: form.houseRules.map((rule) => rule.label),
        laundry: form.laundry,
        laundryEscalation: form.laundryEscalation,
        waste: form.waste,
        systems,
        accessSummary: {
          lockboxCode: form.lockboxCode,
          keyNest: form.keyNest,
          doorCode: form.doorCode,
          accessNotes: form.accessNotes,
        },
      };

      if (mode === "edit" && propertyId) {
        await updateProperty({ id: propertyId, ...payload });
        toast.success("Property updated.");
      } else {
        await createProperty(payload);
        toast.success("Property created.");
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to save property."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DirectoryWizardDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Add property" : "Edit property"}
      description={
        mode === "create"
          ? "Add a property with stay details, connectivity, amenities, and systems."
          : "Update this property’s directory details."
      }
      mode={mode}
      steps={[...STEPS]}
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
      canProceed={!hydrating && canProceed}
      onSubmit={() => void handleSubmit()}
      submitLabel={mode === "create" ? "Create property" : "Save changes"}
      loading={loading || hydrating}
    >
      {hydrating ? (
        <p className="py-10 text-center text-[13px] text-text-muted">Loading property…</p>
      ) : null}

      {!hydrating && activeIndex === 0 ? (
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(name) => patch({ name })} />
          <Input label="Type" value={form.type} onChange={(type) => patch({ type })} />
          <Input
            label="Max guests"
            value={form.maxGuests}
            onChange={(maxGuests) => patch({ maxGuests })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Building number"
              value={form.buildingNumber}
              onChange={(buildingNumber) => patch({ buildingNumber })}
            />
            <Input label="Unit" value={form.unit} onChange={(unit) => patch({ unit })} />
          </div>
          <Input
            label="Address"
            value={form.address}
            onChange={(address) => patch({ address })}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Postal code"
              value={form.postalCode}
              onChange={(postalCode) => patch({ postalCode })}
            />
            <Input label="Area" value={form.area} onChange={(area) => patch({ area })} />
            <Input label="Floor" value={form.floor} onChange={(floor) => patch({ floor })} />
          </div>
          <Input
            label="Guide URL"
            value={form.guideUrl}
            onChange={(guideUrl) => patch({ guideUrl })}
          />
          <Input
            label="Listing URL"
            value={form.listingUrl}
            onChange={(listingUrl) => patch({ listingUrl })}
          />
          <Input
            label="Media folder URL"
            value={form.mediaFolderUrl}
            onChange={(mediaFolderUrl) => patch({ mediaFolderUrl })}
          />
          <Input
            label="Image URL"
            value={form.imageUrl}
            onChange={(imageUrl) => patch({ imageUrl })}
          />
          <Textarea
            label="Specific info"
            value={form.specificInfo}
            onChange={(specificInfo) => patch({ specificInfo })}
          />
        </div>
      ) : null}

      {!hydrating && activeIndex === 1 ? (
        <div className="space-y-4">
          <Input
            label="Check-in time"
            value={form.checkInTime}
            onChange={(checkInTime) => patch({ checkInTime })}
          />
          <Textarea
            label="Check-in instructions"
            value={form.checkInInstructions}
            onChange={(checkInInstructions) => patch({ checkInInstructions })}
          />
          <Input
            label="Check-out time"
            value={form.checkOutTime}
            onChange={(checkOutTime) => patch({ checkOutTime })}
          />
          <Textarea
            label="Check-out instructions"
            value={form.checkOutInstructions}
            onChange={(checkOutInstructions) => patch({ checkOutInstructions })}
          />
          <Textarea
            label="Spare keys"
            value={form.spareKeys}
            onChange={(spareKeys) => patch({ spareKeys })}
          />
          <Textarea
            label="Parking"
            value={form.parking}
            onChange={(parking) => patch({ parking })}
          />
        </div>
      ) : null}

      {!hydrating && activeIndex === 2 ? (
        <div className="space-y-4">
          <Input
            label="WiFi location"
            value={form.wifiLocation}
            onChange={(wifiLocation) => patch({ wifiLocation })}
          />
          <Input
            label="WiFi network"
            value={form.wifiNetwork}
            onChange={(wifiNetwork) => patch({ wifiNetwork })}
          />
          <Input
            label="WiFi password"
            value={form.wifiPassword}
            onChange={(wifiPassword) => patch({ wifiPassword })}
          />
        </div>
      ) : null}

      {!hydrating && activeIndex === 3 ? (
        <div className="space-y-4">
          <DynamicOrderedList
            items={form.houseRules}
            onChange={(items) =>
              patch({
                houseRules: items.map((item) => ({ id: item.id, label: item.label })),
              })
            }
            labelPlaceholder="House rule"
            addLabel="Add rule"
            emptyMessage="No house rules yet."
          />
          <Textarea
            label="Laundry"
            value={form.laundry}
            onChange={(laundry) => patch({ laundry })}
          />
          <EscalationField
            label="Laundry escalation"
            value={form.laundryEscalation}
            onChange={(laundryEscalation) => patch({ laundryEscalation })}
          />
          <Textarea label="Waste" value={form.waste} onChange={(waste) => patch({ waste })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Lockbox code"
              value={form.lockboxCode}
              onChange={(lockboxCode) => patch({ lockboxCode })}
            />
            <Input
              label="KeyNest"
              value={form.keyNest}
              onChange={(keyNest) => patch({ keyNest })}
            />
          </div>
          <Input
            label="Door code"
            value={form.doorCode}
            onChange={(doorCode) => patch({ doorCode })}
          />
          <Textarea
            label="Access notes"
            value={form.accessNotes}
            onChange={(accessNotes) => patch({ accessNotes })}
          />
        </div>
      ) : null}

      {!hydrating && activeIndex === 4 ? (
        <div className="space-y-3">
          {SYSTEM_KEYS.map((key) => {
            const enabled = form.enabledSystems.includes(key);
            const info = form.systems[key] ?? {};
            return (
              <div
                key={key}
                className={cn(
                  "rounded-lg border border-border-color p-3",
                  enabled ? "bg-app-bg/40" : "bg-transparent",
                )}
              >
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border-color"
                    checked={enabled}
                    onChange={(event) => toggleSystem(key, event.target.checked)}
                  />
                  <span className="text-[13px] font-medium text-text-primary">
                    {SYSTEM_LABELS[key]}
                  </span>
                </label>
                {enabled ? (
                  <div className="mt-3 space-y-3 pl-6">
                    <Textarea
                      label="Info"
                      value={info.info ?? ""}
                      onChange={(text) => patchSystem(key, { ...info, info: text })}
                    />
                    <EscalationField
                      value={info.escalation}
                      onChange={(escalation) => patchSystem(key, { ...info, escalation })}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </DirectoryWizardDialog>
  );
}
