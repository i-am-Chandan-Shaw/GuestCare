import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "cancel" | "danger" | "ghost";
type ButtonSize = "default" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "btn-primary-gradient shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-primary/50 text-white",
  secondary:
    "bg-border-color/50 text-text-secondary hover:bg-border-color hover:text-text-primary border border-border-color",
  cancel:
    "text-text-muted bg-transparent hover:text-text-primary uppercase tracking-widest text-[11px]",
  danger: "bg-danger text-white shadow-sm hover:opacity-90",
  ghost:
    "bg-transparent text-text-secondary hover:bg-app-bg hover:text-text-primary border border-transparent hover:border-border-color",
};

const sizeClass: Record<ButtonSize, string> = {
  default: "h-9 px-6 text-xs font-bold rounded-lg",
  lg: "h-12 px-6 text-sm font-bold rounded-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
