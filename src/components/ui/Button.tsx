import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "cancel" | "danger" | "ghost";
/** `default` = small, `lg` = large */
type ButtonSize = "default" | "lg";

const baseVariantClass: Record<ButtonVariant, string> = {
  primary:
    "border-solid border-brand-primary bg-brand-primary text-white hover:bg-brand-primary-soft hover:border-brand-primary-soft active:bg-brand-primary-strong active:border-brand-primary-strong focus-visible:outline-none normal-case font-[family-name:var(--font-display)]",
  secondary:
    "border-solid border-[#e7e7e5] bg-white text-[#2e2a25] hover:bg-[#f7f6f4] hover:border-[#dcdcd8] focus-visible:outline-none focus-visible:border-brand-primary normal-case font-[family-name:var(--font-display)]",
  cancel:
    "border-solid border-transparent bg-transparent text-text-muted hover:text-text-primary uppercase tracking-widest font-sans",
  danger:
    "border-solid border-danger bg-danger text-white hover:opacity-90 focus-visible:outline-none normal-case font-[family-name:var(--font-display)]",
  ghost:
    "border-solid border-transparent bg-transparent text-text-secondary hover:bg-app-bg hover:text-text-primary hover:border-border-color normal-case font-sans",
};


const sizeVariantClass: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: {
    default: "h-9 border-2 rounded-xl px-4 text-sm font-semibold",
    lg: "h-[52px] border-2 rounded-[15px] px-5 text-[17px] font-semibold",
  },
  secondary: {
    default: "h-9 border rounded-xl px-4 text-sm font-semibold",
    lg: "h-[52px] border rounded-[16px] px-4 text-[17px] font-semibold",
  },
  cancel: {
    default: "h-9 border-0 px-2 text-[11px] font-semibold",
    lg: "h-[52px] border-0 px-3 text-[11px] font-semibold",
  },
  danger: {
    default: "h-9 border-2 rounded-xl px-4 text-sm font-semibold",
    lg: "h-[52px] border-2 rounded-[15px] px-5 text-[17px] font-semibold",
  },
  ghost: {
    default: "h-9 border rounded-xl px-3 text-sm font-semibold",
    lg: "h-[52px] border rounded-[16px] px-4 text-[17px] font-semibold",
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
        "relative inline-flex items-center justify-center gap-2 transition-colors duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
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
      <span className={cn("inline-flex items-center justify-center gap-2", loading && "invisible")}>
        {children}
      </span>
    </button>
  ),
);
Button.displayName = "Button";
