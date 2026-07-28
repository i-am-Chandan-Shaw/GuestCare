import { cn } from "@/lib/utils";
import { AGENT } from "@/data/mock";
import { PhoneCall, History, Users, LifeBuoy } from "lucide-react";

export type SidebarNavId = "call" | "history" | "customers";

const nav = [
  { id: "call" as const, label: "New Call", icon: PhoneCall },
  { id: "history" as const, label: "Incident History", icon: History },
  { id: "customers" as const, label: "Customers", icon: Users },
];

export function AppSidebar({
  active,
  onNavigate,
}: {
  active: SidebarNavId;
  onNavigate: (id: SidebarNavId) => void;
}) {
  return (
    <aside
      className="flex h-full w-[240px] shrink-0 flex-col text-white"
      style={{ backgroundColor: "#0B1220" }}
    >
      {/* Brand — logo vertically centered with title + badge stack */}
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

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 px-3 pt-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3.5 py-3 text-[13.5px] font-medium transition-colors",
                isActive
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="truncate text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile footer — name only */}
      <div className="mt-auto border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-[#141C2B] px-3 py-2.5">
          <div className="relative shrink-0">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-[11px] font-bold text-white">
              {AGENT.initials}
            </span>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B1220] bg-[#34C759]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-white">{AGENT.name}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
