import { ShellFrame } from "@/shared/components/ui-kit";
import { AppSidebar } from "@/shared/components/AppSidebar";
import { IncidentComposeShell } from "@/features/incidents/components/IncidentComposeShell";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShellFrame>
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </ShellFrame>
      <IncidentComposeShell />
    </>
  );
}
