import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_shell/directory/$customerId")({
  component: CustomerDirectoryLayout,
});

function CustomerDirectoryLayout() {
  return <Outlet />;
}
