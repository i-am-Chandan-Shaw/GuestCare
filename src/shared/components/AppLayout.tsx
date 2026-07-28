import { Link, useRouterState } from "@tanstack/react-router";
import { ShellFrame } from "@/shared/components/copilot";
import { AppSidebar } from "@/shared/components/AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShellFrame>
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </ShellFrame>
  );
}

export function useActiveNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/agents")) return "agents";
  return "customers";
}
