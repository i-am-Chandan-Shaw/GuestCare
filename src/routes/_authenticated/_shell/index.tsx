import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CallWorkspace } from "@/features/workspace";

const searchSchema = z.object({
  customerId: z.string().optional(),
  propertyId: z.string().optional(),
  issueId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/_shell/")({
  validateSearch: searchSchema,
  component: CustomersRoute,
});

function CustomersRoute() {
  return <CallWorkspace />;
}
