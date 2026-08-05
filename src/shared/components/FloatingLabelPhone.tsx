import { useId, useRef, useState } from "react";
import IntlTelInput, {
  intlTelInput,
  type IntlTelInputRef,
} from "@intl-tel-input/react/with-utils";
import type { ValidationError } from "intl-tel-input";
import "intl-tel-input/styles-no-assets";
import flags1xUrl from "intl-tel-input/dist/img/flags.webp?url";
import flags2xUrl from "intl-tel-input/dist/img/flags@2x.webp?url";
import { cn } from "@/lib/utils";

// Set the flag sprite URLs once — intl-tel-input's CSS reads these via var()
if (typeof document !== "undefined") {
  const root = document.documentElement.style;
  root.setProperty("--iti-path-flags-1x", `url("${flags1xUrl}")`);
  root.setProperty("--iti-path-flags-2x", `url("${flags2xUrl}")`);
}

function getErrorMessage(code: ValidationError | null) {
  if (!code) return "Invalid phone number";
  const { VALIDATION_ERROR } = intlTelInput;
  switch (code) {
    case VALIDATION_ERROR.INVALID_COUNTRY_CODE:
      return "Invalid country code";
    case VALIDATION_ERROR.TOO_SHORT:
      return "Phone number is too short";
    case VALIDATION_ERROR.TOO_LONG:
      return "Phone number is too long";
    case VALIDATION_ERROR.INVALID_LENGTH:
      return "Phone number has an invalid length";
    default:
      return "Invalid phone number";
  }
}

export function FloatingLabelPhone({
  label,
  value,
  onChange,
  onValidityChange,
  disabled,
  readOnly,
  className,
  id: idProp,
  error: externalError,
  initialCountry = "gb",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  id?: string;
  error?: string;
  initialCountry?: string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;
  const itiRef = useRef<IntlTelInputRef>(null);

  const [isValid, setIsValid] = useState(true);
  const [errorCode, setErrorCode] = useState<ValidationError | null>(null);
  const [touched, setTouched] = useState(false);

  const locked = Boolean(disabled || readOnly);

  const applyValidity = (valid: boolean, code: ValidationError | null) => {
    setIsValid(valid);
    setErrorCode(code);
    onValidityChange?.(valid);
  };

  const syncValidityFromInstance = () => {
    const iti = itiRef.current?.getInstance();
    if (!iti?.isActive()) return;

    // Empty input is not an error state until the form requires a phone.
    const number = (iti.getNumber() ?? "").trim();
    if (!number) {
      applyValidity(true, null);
      return;
    }

    const valid = iti.isValidNumberPrecise() ?? false;
    applyValidity(valid, valid ? null : iti.getValidationError());
  };

  const hasValue = value.trim().length > 0;
  // Show after blur (or when parent passes error). Avoid "too short" flashing mid-keystroke.
  const isInvalid = !isValid && touched && hasValue;
  const displayError = externalError || (isInvalid ? getErrorMessage(errorCode) : undefined);
  const hasError = Boolean(displayError);

  return (
    <div className={cn("gc-phone block", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <div
        className={cn(
          "gc-phone__shell relative rounded-[var(--kn-radius-lg)] border bg-card-bg transition-colors duration-150",
          hasError
            ? "border-destructive focus-within:border-destructive"
            : cn("border-input-border", !locked && "focus-within:border-input-border-focus"),
          locked && "cursor-not-allowed bg-app-bg/60",
          disabled && "opacity-60",
        )}
      >
        <IntlTelInput
          ref={itiRef}
          initialCountry={initialCountry as never}
          separateDialCode
          value={value}
          onChangeNumber={(number) => {
            onChange(number);
            // Keep local validity in sync as the user types (error UI waits for blur).
            requestAnimationFrame(syncValidityFromInstance);
          }}
          onChangeCountry={() => {
            requestAnimationFrame(syncValidityFromInstance);
          }}
          onChangeValidity={(valid) => {
            const number =
              itiRef.current?.getInstance()?.getNumber()?.trim() || value.trim();
            // Library reports empty as invalid (TOO_SHORT); don't surface that as an error.
            if (!number) {
              applyValidity(true, null);
              return;
            }
            setIsValid(valid);
            onValidityChange?.(valid);
          }}
          onChangeErrorCode={(code) => {
            const number =
              itiRef.current?.getInstance()?.getNumber()?.trim() || value.trim();
            setErrorCode(number ? code : null);
          }}
          usePreciseValidation
          disabled={disabled}
          readOnly={readOnly}
          inputProps={{
            id,
            onBlur: () => {
              setTouched(true);
              syncValidityFromInstance();
            },
            "aria-invalid": hasError || undefined,
            "aria-describedby": hasError ? errorId : undefined,
            "aria-label": label,
            className: cn(
              "gc-phone__input h-12 w-full bg-transparent pr-3 text-[15px] font-medium leading-5 text-text-primary outline-none",
              "placeholder:text-text-muted",
              locked && "cursor-not-allowed text-text-secondary",
            ),
          }}
        />
      </div>

      {hasError ? (
        <p id={errorId} className="mt-1.5 text-[11px] leading-snug text-destructive" role="alert">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
