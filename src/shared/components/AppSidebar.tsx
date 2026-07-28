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
    <aside
      className="flex h-full w-[240px] shrink-0 flex-col text-white"
      style={{ backgroundColor: "#0B1220" }}
    >
      <div className="flex items-center gap-3 px-4 pt-5 pb-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5">
          <LifeBuoy className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold tracking-tight text-white leading-tight">
            GuestCare
          </div>
          <span className="mt-1.5 inline-flex items-center rounded border border-[#3B82F6]/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#60A5FA]">
            Live Copilot
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 pt-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3.5 py-3 text-[13.5px] font-medium transition-colors",
                isActive
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="truncate text-left">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-[#141C2B] px-3 py-2.5">
          <div className="relative shrink-0">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-bold text-white">
              {CURRENT_AGENT.initials}
            </span>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B1220] bg-[#34C759]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">{CURRENT_AGENT.name}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
