import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { CURRENT_AGENT } from "@/shared/constants/agent";
import { BarChart3, Users, UserCircle, LifeBuoy } from "lucide-react";

const nav = [
  { id: "customers" as const, label: "Customers", href: "/", icon: Users },
  { id: "reports" as const, label: "Reports", href: "/reports", icon: BarChart3 },
  { id: "agents" as const, label: "Agents", href: "/agents", icon: UserCircle },
];

function useActiveNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/agents")) return "agents";
  return "customers";
}

export function AppSidebar() {
  const active = useActiveNav();

  return (
    <aside className="relative flex h-full w-[var(--sidebar-width)] shrink-0 flex-col bg-sidebar-bg text-sidebar-text-active">
      {/* Subtle top glow — ties sidebar to brand without flat black */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-primary/12 to-transparent"
        aria-hidden
      />

      <div className="relative flex items-center gap-3 px-4 pt-5 pb-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-sm">
          <LifeBuoy className="h-5 w-5 text-brand-primary-soft" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold tracking-tight text-white leading-tight">
            GuestCare
          </div>
          <span className="mt-1.5 inline-flex items-center rounded border border-brand-primary/30 bg-brand-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-primary-soft">
            Live Copilot
          </span>
        </div>
      </div>

      <nav className="relative flex-1 space-y-0.5 px-3 pt-1" aria-label="Main navigation">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <Link
              key={item.id}
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                  : "text-sidebar-text hover:bg-white/[0.06] hover:text-white",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="truncate text-left">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-auto border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-sidebar-surface px-3 py-2.5">
          <div className="relative shrink-0">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full btn-primary-gradient text-[11px] font-bold text-white ring-2 ring-white/10">
              {CURRENT_AGENT.initials}
            </span>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-sidebar-surface bg-success" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">{CURRENT_AGENT.name}</div>
            <div className="truncate text-[11px] text-sidebar-text">{CURRENT_AGENT.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
