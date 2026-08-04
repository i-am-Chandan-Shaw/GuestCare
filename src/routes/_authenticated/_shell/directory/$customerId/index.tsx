import { createFileRoute } from "@tanstack/react-router";
import { PropertiesPage } from "@/features/directory";

export const Route = createFileRoute("/_authenticated/_shell/directory/$customerId/")({
  component: CustomerPropertiesRoute,
});

function CustomerPropertiesRoute() {
  return <PropertiesPage />;
}
