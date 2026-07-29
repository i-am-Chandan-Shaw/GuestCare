import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

type CardVariant = "default" | "minimal" | "glass";

const variantClass: Record<CardVariant, string> = {
  default: "rounded-xl border border-border-color bg-card-bg shadow-sm",
  minimal: "rounded-[12px] bg-white shadow-sm hover:shadow-md transition-shadow",
  glass: "rounded-xl bg-white/70 backdrop-blur-md border border-white/60",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padded?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padded = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(variantClass[variant], padded && "p-4", className)}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = "Card";

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between border-b border-border-color px-5 py-4", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-border-color bg-app-bg/50 px-5 py-4", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-bold tracking-tight text-text-primary", className)}
      {...props}
    />
  );
}
