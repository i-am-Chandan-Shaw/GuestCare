import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "cancel" | "danger" | "ghost";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "btn-primary-gradient h-9 px-6 text-xs font-bold rounded-lg text-white shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-primary/50",
  secondary:
    "h-9 px-6 text-xs font-semibold rounded-lg bg-border-color/50 text-text-primary/70 hover:bg-border-color border border-border-color",
  cancel:
    "h-9 px-4 text-[11px] font-semibold uppercase tracking-widest text-text-secondary bg-transparent hover:text-text-primary",
  danger: "h-9 px-6 text-xs font-bold rounded-lg bg-danger text-white shadow-sm hover:opacity-90",
  ghost:
    "h-9 px-4 text-xs font-semibold rounded-lg bg-transparent text-text-primary/70 hover:bg-app-bg border border-transparent hover:border-border-color",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variantClass[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
