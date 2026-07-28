import { cn } from "@/lib/utils";
import { AGENT } from "@/data/mock";
import {
  LayoutDashboard, PhoneCall, History, Users, BarChart3, Settings,
  Sparkles, LifeBuoy,
} from "lucide-react";
import { type ReactNode, useState } from "react";

const nav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null as string | null },
  { id: "call",      label: "New Call",   icon: PhoneCall, badge: "Live" },
  { id: "history",   label: "Incident History", icon: History, badge: null },
  { id: "customers", label: "Customers",  icon: Users, badge: null },
  { id: "reports",   label: "Reports",    icon: BarChart3, badge: null },
  { id: "settings",  label: "Settings",   icon: Settings, badge: null },
];

export function AppSidebar() {
  const [active, setActive] = useState("call");
  return (
    <aside className="flex w-[236px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-info shadow-glow">
          <LifeBuoy className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold tracking-tight text-foreground">GuestCare</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Live Copilot</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={cn(
                "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-surface-2 text-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-destructive">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 rounded-lg border border-border bg-panel p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Copilot Tip</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
          Press <span className="kbd">⌘K</span> anywhere to search customers, properties, or issues instantly.
        </p>
      </div>

      <div className="flex items-center gap-2.5 border-t border-border px-3 py-3">
        <Avatar initials={AGENT.initials} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-semibold text-foreground">{AGENT.name}</div>
          <div className="truncate text-[10.5px] text-muted-foreground">{AGENT.shift}</div>
        </div>
        <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_0_3px_oklch(0.72_0.16_155/0.15)]" />
      </div>
    </aside>
  );
}

export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-info/80 font-semibold text-primary-foreground",
        size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-[11px]",
      )}
    >
      {initials}
    </span>
  );
}

export function ShellFrame({ children }: { children: ReactNode }) {
  return <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">{children}</div>;
}
