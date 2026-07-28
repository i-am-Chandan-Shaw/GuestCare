import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppLayout } from "@/shared/components/AppLayout";
import { ReportsPage } from "@/features/reports";

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
      <ReportsPage customerId={customerId} />
    </AppLayout>
  );
}
