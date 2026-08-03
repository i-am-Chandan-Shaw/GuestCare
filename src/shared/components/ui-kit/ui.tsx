import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export function Chip({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  className?: string;
}) {
  const tones = {
    default: "bg-muted/80 text-text-secondary border-text-secondary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info/10 text-info border-info/20",
    outline: "bg-card-bg text-text-primary border-border-color",
  };
  return (
    <span
      className={cn(
        "inline-flex h-[24px] items-center gap-1.5 rounded-full border px-2 text-[11px] font-semibold backdrop-blur-[2px]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border-color bg-card-bg shadow-sm",
        className,
      )}
    >
      {title && (
        <header className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <h3 className="min-w-0 flex-1 text-[13.5px] font-semibold text-text-primary">{title}</h3>
          {action}
        </header>
      )}
      <div className={cn(padded && "p-4")}>{children}</div>
    </section>
  );
}

export function ShellFrame({ children }: { children: ReactNode }) {
  return <div className="flex h-screen w-full flex-row overflow-hidden bg-app-bg text-text-primary">{children}</div>;
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
  variant = "pill",
}: {
  tabs: { id: T; label: string; icon?: ReactNode }[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
  variant?: "pill" | "underline";
}) {
  if (variant === "underline") {
    return (
      <div className={cn("flex gap-6 border-b border-border-color/60", className)}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-1 py-3 text-[13px] font-medium transition-colors -mb-px",
              active === t.id
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:border-border-color hover:text-text-primary",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid h-9 w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))] rounded-lg border border-border-color bg-slate-100/80 p-0.5",
        className,
      )}
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-semibold leading-none transition-colors",
              isActive
                ? "bg-white text-brand-primary shadow-sm"
                : "bg-transparent text-text-secondary hover:text-text-primary",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
