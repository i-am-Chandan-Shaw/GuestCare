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
    <aside className="flex h-full w-[var(--sidebar-width)] shrink-0 flex-col bg-sidebar-bg">
      <div className="flex items-center gap-3 px-4 pt-5 pb-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <LifeBuoy className="h-5 w-5 text-brand-primary-soft" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold tracking-tight text-white leading-tight">
            GuestCare
          </div>
          <span className="mt-1.5 inline-flex items-center text-[9px] font-semibold uppercase tracking-wider text-sidebar-text">
            Live Copilot
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3" aria-label="Main navigation">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <Link
              key={item.id}
              to={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150",
                isActive
                  ? "btn-primary-gradient text-white"
                  : "text-sidebar-text hover:bg-white/[0.05] hover:text-white",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="relative shrink-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full btn-primary-gradient text-[10px] font-bold text-white">
              {CURRENT_AGENT.initials}
            </span>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-sidebar-bg bg-success" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-white">{CURRENT_AGENT.name}</div>
            <div className="truncate text-[11px] text-sidebar-text">{CURRENT_AGENT.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
