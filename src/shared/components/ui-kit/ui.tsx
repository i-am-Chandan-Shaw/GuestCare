import { cn } from "@/lib/utils";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X, ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Keyboard badge                                                     */
/* ------------------------------------------------------------------ */
export function Kbd({ children }: { children: ReactNode }) {
  return <span className="kbd">{children}</span>;
}

/* ------------------------------------------------------------------ */
/*  Chip / badge                                                       */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Section card                                                       */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Icon button                                                        */
/* ------------------------------------------------------------------ */
export function IconButton({
  children,
  onClick,
  title,
  className,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-all",
        "hover:border-border hover:bg-surface-2 hover:text-foreground",
        active && "border-border bg-surface-2 text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Avatar                                                             */
/* ------------------------------------------------------------------ */
export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-primary-strong to-brand-primary-soft font-semibold text-white",
        size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-[11px]",
      )}
    >
      {initials}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Shell frame (root layout wrapper)                                  */
/* ------------------------------------------------------------------ */
export function ShellFrame({ children }: { children: ReactNode }) {
  return <div className="flex h-screen w-full flex-row overflow-hidden bg-app-bg text-text-primary">{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Portal-based Combobox (fixed positioning, no z-index issues)       */
/* ------------------------------------------------------------------ */
export interface ComboItem { id: string; label: string; sublabel?: string; meta?: string }

export function Combobox({
  items,
  value,
  onSelect,
  placeholder,
  icon = <Search className="h-3.5 w-3.5" />,
  width = "w-72",
  disabled = false,
}: {
  items: ComboItem[];
  value?: ComboItem | null;
  onSelect: (item: ComboItem) => void;
  placeholder: string;
  icon?: ReactNode;
  width?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (disabled) {
      setOpen(false);
      setQ("");
    }
  }, [disabled]);

  // Calculate dropdown position from trigger
  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 280) });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open, updatePos]);

  // Click-outside
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = items.filter((i) =>
    (i.label + " " + (i.sublabel ?? "")).toLowerCase().includes(q.toLowerCase()),
  );

  const dropdown = open && !disabled
    ? createPortal(
        <div
          ref={dropRef}
          className="popover-enter overflow-hidden rounded-xl border border-border-color bg-card-bg shadow-lg"
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-surface/50 backdrop-blur">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type to filter…"
              className="w-full bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="max-h-72 overflow-y-auto scrollbar-thin py-1.5">
            {filtered.length === 0 && (
              <li className="px-4 py-8 text-center text-[13px] text-muted-foreground">No results</li>
            )}
            {filtered.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => { onSelect(i); setOpen(false); setQ(""); }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-foreground">{i.label}</span>
                    {i.sublabel && (
                      <span className="block truncate text-[11px] text-muted-foreground">{i.sublabel}</span>
                    )}
                  </span>
                  {i.meta && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{i.meta}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
        }}
        className={cn(
          "flex h-9 items-center gap-2.5 rounded-lg border border-input-border bg-input-surface px-3 text-left text-xs transition-colors shadow-sm",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-border-color hover:bg-card-bg",
          open && !disabled && "border-input-border-focus ring-2 ring-brand-primary/20",
          width,
        )}
      >
        <span className="text-muted-foreground">{icon}</span>
        <span className={cn("flex-1 truncate", value ? "text-foreground font-medium" : "text-muted-foreground")}>
          {value ? value.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            open && !disabled && "rotate-180",
          )}
        />
      </button>
      {dropdown}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Drawer (slides in from right)                                      */
/* ------------------------------------------------------------------ */
export function Drawer({
  open,
  onClose,
  children,
  title,
  subtitle,
  width = "w-[440px]",
  badge,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
  subtitle?: string;
  width?: string;
  badge?: ReactNode;
}) {
  const [exiting, setExiting] = useState(false);

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, 200);
  }, [onClose]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  if (!open && !exiting) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex justify-end">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40",
          exiting ? "backdrop-exit" : "backdrop-enter",
        )}
        onClick={handleClose}
      />
      {/* Panel */}
      <div
        className={cn(
          "relative flex h-full flex-col border-l border-border-color bg-card-bg shadow-2xl",
          width,
          exiting ? "drawer-exit" : "drawer-enter",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
              {badge}
            </div>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            onClick={handleClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
