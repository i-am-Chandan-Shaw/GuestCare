import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PropertiesPage } from "@/features/directory";

const searchSchema = z.object({
  customerName: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/_shell/directory/$customerId/")({
  validateSearch: searchSchema,
  component: CustomerPropertiesRoute,
});

function CustomerPropertiesRoute() {
  return <PropertiesPage />;
}
