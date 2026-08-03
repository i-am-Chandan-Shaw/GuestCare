import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "cancel" | "danger" | "ghost";
type ButtonSize = "default" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-white hover:bg-brand-primary-soft active:bg-brand-primary-strong focus-visible:outline-none focus-visible:border-brand-primary",
  secondary:
    "bg-card-bg text-text-primary border border-border-color hover:bg-app-bg hover:border-input-border focus-visible:border-brand-primary",
  cancel:
    "text-text-muted bg-transparent hover:text-text-primary uppercase tracking-widest text-[11px] font-sans",
  danger: "bg-danger text-white hover:opacity-90 focus-visible:border-danger",
  ghost:
    "bg-transparent text-text-secondary hover:bg-app-bg hover:text-text-primary border border-transparent hover:border-border-color",
};

const sizeClass: Record<ButtonSize, string> = {
  default: "h-10 px-5 text-[13px] font-bold rounded-full font-[family-name:var(--font-display)]",
  lg: "h-12 px-6 text-sm font-bold rounded-full font-[family-name:var(--font-display)]",
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
        variantClass[variant],
        sizeClass[size],
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
