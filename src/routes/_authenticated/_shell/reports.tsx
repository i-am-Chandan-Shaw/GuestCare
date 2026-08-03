import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ReportsPage } from "@/features/reports/components/ReportsPage";

const searchSchema = z.object({
  customerId: z.string().optional(),
  reportId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/_shell/reports")({
  validateSearch: searchSchema,
  component: ReportsRoute,
});

function ReportsRoute() {
  const { customerId, reportId } = Route.useSearch();
  return <ReportsPage customerId={customerId} reportId={reportId} />;
}
