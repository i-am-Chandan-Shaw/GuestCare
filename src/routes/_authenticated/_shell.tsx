import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/shared/components/AppLayout";

export const Route = createFileRoute("/_authenticated/_shell")({
  component: AppShellLayout,
});

function AppShellLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
