import { createFileRoute } from "@tanstack/react-router";
import { CustomersPage } from "@/features/directory";

export const Route = createFileRoute("/_authenticated/_shell/directory/")({
  component: DirectoryIndexRoute,
});

function DirectoryIndexRoute() {
  return <CustomersPage />;
}
