import {
  FloatingLabelInput,
  FloatingLabelSelect,
  FloatingLabelTextarea,
  type FloatingEndAction,
} from "@/shared/components/FloatingLabelField";

export type { FloatingEndAction };
export {
  useCopyEndAction,
  usePasswordEndAction,
  createInfoEndAction,
  InfoEndActionButton,
} from "@/shared/components/FloatingLabelField";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="mb-2 block text-[13px] font-semibold text-text-primary">{label}</span>
      {children}
    </div>
  );
}

export function Input({
  label,
  value,
  onChange,
  placeholder: _placeholder,
  mono,
  readOnly,
  type = "text",
  className,
  disabled,
  endAction,
  autoComplete,
  name,
  required,
  id,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  readOnly?: boolean;
  type?: React.HTMLInputTypeAttribute;
  className?: string;
  disabled?: boolean;
  endAction?: FloatingEndAction;
  autoComplete?: string;
  name?: string;
  required?: boolean;
  id?: string;
}) {
  return (
    <FloatingLabelInput
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      mono={mono}
      readOnly={readOnly}
      disabled={disabled}
      className={className}
      endAction={endAction}
      autoComplete={autoComplete}
      name={name}
      required={required}
      id={id}
    />
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder: _placeholder,
  rows = 3,
  readOnly,
  disabled,
  className,
  endAction,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  endAction?: FloatingEndAction;
  id?: string;
}) {
  return (
    <FloatingLabelTextarea
      label={label}
      value={value}
      onChange={onChange}
      rows={rows}
      readOnly={readOnly}
      disabled={disabled}
      className={className}
      endAction={endAction}
      id={id}
    />
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  optionLabels,
  disabled,
  className,
  endAction,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  optionLabels?: Record<string, string>;
  disabled?: boolean;
  className?: string;
  endAction?: FloatingEndAction;
  id?: string;
}) {
  return (
    <FloatingLabelSelect
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      optionLabels={optionLabels}
      disabled={disabled}
      className={className}
      endAction={endAction}
      id={id}
    />
  );
}
