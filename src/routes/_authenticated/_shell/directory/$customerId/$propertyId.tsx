import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProtocolsPage } from "@/features/directory";

const searchSchema = z.object({
  customerName: z.string().optional(),
  propertyName: z.string().optional(),
});

export const Route = createFileRoute(
  "/_authenticated/_shell/directory/$customerId/$propertyId",
)({
  validateSearch: searchSchema,
  component: PropertyProtocolsRoute,
});

function PropertyProtocolsRoute() {
  return <ProtocolsPage />;
}
