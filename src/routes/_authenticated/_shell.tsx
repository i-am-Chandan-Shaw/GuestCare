import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/shared/components/AppLayout";
import agGridCss from "../../styles/ag-grid.css?url";
import agGridScrollbarCss from "../../styles/ag-grid-scrollbar-visibility.css?url";
import "@/lib/ag-grid-setup";

export const Route = createFileRoute("/_authenticated/_shell")({
  head: () => ({
    links: [
      { rel: "stylesheet", href: agGridCss },
      { rel: "stylesheet", href: agGridScrollbarCss },
    ],
  }),
  component: AppShellLayout,
});

function AppShellLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
