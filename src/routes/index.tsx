import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppLayout } from "@/shared/components/AppLayout";
import { CallWorkspace } from "@/features/workspace";

const searchSchema = z.object({
  customerId: z.string().optional(),
  propertyId: z.string().optional(),
  issueId: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: CustomersRoute,
});

function CustomersRoute() {
  return (
    <AppLayout>
      <CallWorkspace />
    </AppLayout>
  );
}
