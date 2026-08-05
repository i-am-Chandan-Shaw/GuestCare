import { ShellFrame } from "@/components/ui/UiKit";
import { AppSidebar } from "@/shared/components/AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShellFrame>
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </ShellFrame>
  );
}
