import { Check, Copy, Eye, EyeOff, Info } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/copy-to-clipboard";

export type FloatingEndAction = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

type ShellProps = {
  label: string;
  value: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  id?: string;
  endAction?: FloatingEndAction;
  alwaysFloat?: boolean;
  error?: string;
  children: (props: {
    id: string;
    className: string;
    onFocus: () => void;
    onBlur: () => void;
    ariaInvalid?: boolean;
    ariaDescribedBy?: string;
  }) => ReactNode;
};

function EndActionButton({
  action,
  fieldDisabled,
}: {
  action: FloatingEndAction;
  fieldDisabled?: boolean;
}) {
  const disabled = Boolean(action.disabled || fieldDisabled);
  return (
    <button
      type="button"
      onClick={disabled ? undefined : action.onClick}
      disabled={disabled}
      aria-label={action.label}
      title={action.label}
      className={cn(
        "absolute right-2 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors",
        disabled
          ? "cursor-not-allowed text-text-muted/40"
          : "cursor-pointer text-text-muted hover:bg-app-bg hover:text-text-primary",
      )}
    >
      {action.icon}
    </button>
  );
}

function FloatingShell({
  label,
  value,
  disabled,
  readOnly,
  className,
  id: idProp,
  endAction,
  alwaysFloat,
  error,
  children,
}: ShellProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;
  const [focused, setFocused] = useState(false);
  const locked = Boolean(disabled || readOnly);
  const hasValue = value.trim().length > 0;
  const floated = alwaysFloat || hasValue || (!locked && focused);
  const hasError = Boolean(error);

  return (
    <div className={cn("block", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--kn-radius-lg)] border bg-card-bg transition-colors duration-150",
          hasError
            ? "border-destructive focus-within:border-destructive"
            : cn("border-input-border", !locked && "focus-within:border-input-border-focus"),
          locked && "cursor-not-allowed bg-app-bg/60",
          disabled && "opacity-60",
        )}
      >
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3 z-[1] origin-left uppercase tracking-wide transition-all duration-150",
            hasError ? "text-destructive" : "text-text-muted",
            floated
              ? "top-2 translate-y-0 text-[10px] font-semibold"
              : "top-1/2 -translate-y-1/2 text-[13px] font-medium",
          )}
        >
          {label}
        </label>
        {children({
          id,
          onFocus: () => {
            if (!locked) setFocused(true);
          },
          onBlur: () => setFocused(false),
          ariaInvalid: hasError || undefined,
          ariaDescribedBy: hasError ? errorId : undefined,
          className: cn(
            "w-full bg-transparent text-[13px] text-text-primary outline-none",
            "placeholder:text-transparent",
            floated ? "pb-2.5 pt-5" : "py-3",
            endAction ? "pr-11" : "pr-3",
            "pl-3",
            locked && "cursor-not-allowed text-text-secondary",
          ),
        })}
        {endAction ? <EndActionButton action={endAction} fieldDisabled={disabled} /> : null}
      </div>
      {hasError ? (
        <p id={errorId} className="mt-1.5 text-[11px] leading-snug text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FloatingLabelInput({
  label,
  value,
  onChange,
  type = "text",
  disabled,
  readOnly,
  className,
  id,
  endAction,
  mono,
  autoComplete,
  name,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  id?: string;
  endAction?: FloatingEndAction;
  mono?: boolean;
  autoComplete?: string;
  name?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <FloatingShell
      label={label}
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      className={className}
      id={id}
      endAction={endAction}
      error={error}
    >
      {({ id: fieldId, className: fieldClassName, onFocus, onBlur, ariaInvalid, ariaDescribedBy }) => (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          required={required}
          placeholder={label}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(fieldClassName, "h-[52px]", mono && "font-mono")}
        />
      )}
    </FloatingShell>
  );
}

export function FloatingLabelTextarea({
  label,
  value,
  onChange,
  rows = 3,
  disabled,
  readOnly,
  className,
  id,
  endAction,
  error,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  rows?: number;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  id?: string;
  endAction?: FloatingEndAction;
  error?: string;
}) {
  return (
    <FloatingShell
      label={label}
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      className={className}
      id={id}
      endAction={endAction}
      alwaysFloat
      error={error}
    >
      {({ id: fieldId, className: fieldClassName, onFocus, onBlur, ariaInvalid, ariaDescribedBy }) => (
        <textarea
          id={fieldId}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          placeholder={label}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(fieldClassName, "resize-none leading-relaxed")}
        />
      )}
    </FloatingShell>
  );
}

export function FloatingLabelSelect({
  label,
  value,
  onChange,
  options,
  optionLabels,
  disabled,
  className,
  id,
  endAction,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  optionLabels?: Record<string, string>;
  disabled?: boolean;
  className?: string;
  id?: string;
  endAction?: FloatingEndAction;
  error?: string;
}) {
  return (
    <FloatingShell
      label={label}
      value={value}
      disabled={disabled}
      className={className}
      id={id}
      endAction={endAction}
      alwaysFloat
      error={error}
    >
      {({ id: fieldId, className: fieldClassName, onFocus, onBlur, ariaInvalid, ariaDescribedBy }) => (
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={cn(
            fieldClassName,
            "h-[52px] appearance-none font-medium",
            "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%23666%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center]",
            endAction ? "pr-16" : "pr-9",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          {options.map((option) => (
            <option
              key={option}
              value={option.startsWith("P") && option.includes("·") ? option.split(" ")[0] : option}
            >
              {optionLabels?.[option] ?? option}
            </option>
          ))}
        </select>
      )}
    </FloatingShell>
  );
}

export function usePasswordEndAction(visible: boolean, onToggle: () => void): FloatingEndAction {
  return {
    icon: visible ? (
      <EyeOff className="h-4 w-4" strokeWidth={2} />
    ) : (
      <Eye className="h-4 w-4" strokeWidth={2} />
    ),
    label: visible ? "Hide password" : "Show password",
    onClick: onToggle,
  };
}

export function useCopyEndAction(value: string, label: string): FloatingEndAction {
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(value && value !== "—");

  return {
    icon: copied ? (
      <Check className="h-4 w-4 text-success" strokeWidth={2.5} />
    ) : (
      <Copy className="h-4 w-4" strokeWidth={2} />
    ),
    label: copied ? "Copied" : `Copy ${label}`,
    disabled: !canCopy,
    onClick: () => {
      void copyText(value, `${label} copied`).then((ok) => {
        if (!ok) return;
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      });
    },
  };
}

export function InfoEndActionButton({
  content,
  disabled,
}: {
  content: ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute right-2 top-1/2 z-20 -translate-y-1/2">
      <button
        type="button"
        disabled={disabled}
        aria-label="More info"
        title="More info"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          disabled
            ? "cursor-not-allowed text-text-muted/40"
            : "cursor-pointer text-text-muted hover:bg-app-bg hover:text-text-primary",
        )}
      >
        <Info className="h-4 w-4" strokeWidth={2} />
      </button>
      {open && !disabled ? (
        <>
          <button
            type="button"
            aria-label="Dismiss info"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1.5 w-56 rounded-lg border border-border-color bg-card-bg p-3 text-[12px] leading-relaxed text-text-secondary shadow-lg">
            {content}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function createInfoEndAction(onClick: () => void, disabled?: boolean): FloatingEndAction {
  return {
    icon: <Info className="h-4 w-4" strokeWidth={2} />,
    label: "More info",
    onClick,
    disabled,
  };
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block">
      <span className="mb-2 block text-[13px] font-semibold text-text-primary">{label}</span>
      {children}
    </div>
  );
}

export {
  FloatingLabelInput as Input,
  FloatingLabelTextarea as Textarea,
  FloatingLabelSelect as Select,
};
