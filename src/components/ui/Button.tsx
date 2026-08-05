import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "cancel" | "danger" | "ghost";
type ButtonSize = "sm" | "default" | "lg";

/** Primary shape/type — secondary reuses this and only swaps colors. */
const primaryBase =
  "border border-solid border-[#e7e7e5] normal-case font-[family-name:var(--font-display)] focus-visible:outline-none";

const primarySize: Record<ButtonSize, string> = {
  sm: "h-[33px] rounded-[var(--kn-radius-pill)] px-3 py-[5px] text-[15px] font-semibold",
  default: "h-9 rounded-[16px] px-4 text-[15px] font-semibold",
  lg: "h-12 rounded-[16px] px-10 text-[15px] font-semibold",
};

const secondarySize: Record<ButtonSize, string> = {
  sm: "h-[33px] rounded-[var(--kn-radius-pill)] px-3 py-[5px] text-[15px] font-semibold",
  default: "h-9 rounded-[16px] px-4 text-[15px] font-semibold",
  lg: "h-12 rounded-[16px] px-5 text-[15px] font-semibold",
};

const sizeGap: Record<ButtonSize, string> = {
  sm: "gap-[5px]",
  default: "gap-2",
  lg: "gap-2",
};

const baseVariantClass: Record<ButtonVariant, string> = {
  primary: cn(primaryBase, "bg-brand-primary text-white"),
  secondary: cn(
    primaryBase,
    "bg-white text-[#2e2a25] focus-visible:border-brand-primary",
  ),
  cancel:
    "border-solid border-transparent bg-transparent text-text-muted uppercase tracking-widest font-sans",
  danger:
    "border border-solid border-danger bg-danger text-white focus-visible:outline-none normal-case font-[family-name:var(--font-display)]",
  ghost:
    "border border-solid border-transparent bg-transparent text-text-secondary normal-case font-sans",
};

const sizeVariantClass: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: primarySize,
  secondary: secondarySize,
  cancel: {
    sm: "h-[33px] border-0 px-2 text-[11px] font-semibold",
    default: "h-9 border-0 px-2 text-[11px] font-semibold",
    lg: "h-12 border-0 px-3 text-[11px] font-semibold",
  },
  danger: primarySize,
  ghost: {
    sm: "h-[33px] rounded-[var(--kn-radius-pill)] px-3 py-[5px] text-[15px] font-semibold",
    default: "h-9 rounded-[16px] px-3 text-[15px] font-semibold",
    lg: "h-12 rounded-[16px] px-4 text-[15px] font-semibold",
  },
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      type = "button",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center transition-[opacity] duration-300 ease-out enabled:hover:opacity-80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        sizeGap[size],
        baseVariantClass[variant],
        sizeVariantClass[variant][size],
        className,
      )}
      {...props}
    >
      {loading && (
        <Loader2
          className="absolute h-4 w-4 animate-spin"
          aria-hidden
        />
      )}
      <span
        className={cn(
          "inline-flex items-center justify-center",
          sizeGap[size],
          loading && "invisible",
        )}
      >
        {children}
      </span>
    </button>
  ),
);
Button.displayName = "Button";
