import { Input, Select } from "@/shared/components/FloatingLabelField";
import type { EscalationKind } from "@/shared/types";

const PRESETS = ["host", "emergency-then-host", "custom"] as const;

const PRESET_LABELS: Record<(typeof PRESETS)[number], string> = {
  host: "Call Host",
  "emergency-then-host": "Call emergency services then host",
  custom: "Custom",
};

function kindToPreset(kind: EscalationKind | undefined): (typeof PRESETS)[number] {
  if (!kind) return "host";
  if (typeof kind === "object" && "custom" in kind) return "custom";
  if (kind === "emergency-then-host") return "emergency-then-host";
  return "host";
}

function kindToCustomText(kind: EscalationKind | undefined): string {
  if (kind && typeof kind === "object" && "custom" in kind) return kind.custom;
  return "";
}

export function EscalationField({
  label = "Escalation",
  value,
  onChange,
  disabled,
  error,
}: {
  label?: string;
  value: EscalationKind | undefined;
  onChange: (value: EscalationKind | undefined) => void;
  disabled?: boolean;
  error?: string;
}) {
  const preset = kindToPreset(value);
  const customText = kindToCustomText(value);

  return (
    <div className="space-y-3">
      <Select
        label={label}
        value={preset}
        options={[...PRESETS]}
        optionLabels={PRESET_LABELS}
        disabled={disabled}
        error={error}
        onChange={(next) => {
          if (next === "custom") {
            onChange({ custom: customText || "" });
            return;
          }
          if (next === "emergency-then-host") {
            onChange("emergency-then-host");
            return;
          }
          onChange("host");
        }}
      />
      {preset === "custom" ? (
        <Input
          label="Escalation details"
          value={customText}
          disabled={disabled}
          onChange={(text) => onChange({ custom: text })}
        />
      ) : null}
    </div>
  );
}
