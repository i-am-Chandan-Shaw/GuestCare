import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { IncidentReportsPage } from "@/features/incidents";

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
  return <IncidentReportsPage customerId={customerId} reportId={reportId} />;
}
