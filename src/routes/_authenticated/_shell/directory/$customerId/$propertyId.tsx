import { createFileRoute } from "@tanstack/react-router";
import { ProtocolsPage } from "@/features/directory";

export const Route = createFileRoute(
  "/_authenticated/_shell/directory/$customerId/$propertyId",
)({
  component: PropertyProtocolsRoute,
});

function PropertyProtocolsRoute() {
  return <ProtocolsPage />;
}
