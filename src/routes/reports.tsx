import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppLayout } from "@/shared/components/AppLayout";
import { IncidentReportsPage } from "@/features/incidents";

const searchSchema = z.object({
  customerId: z.string().optional(),
});

export const Route = createFileRoute("/reports")({
  validateSearch: searchSchema,
  component: ReportsRoute,
});

function ReportsRoute() {
  const { customerId } = Route.useSearch();
  return (
    <AppLayout>
      <IncidentReportsPage customerId={customerId} />
    </AppLayout>
  );
}
