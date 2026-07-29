import { createFileRoute } from "@tanstack/react-router";
import { IncidentComposePopupPage } from "@/features/incidents/components/IncidentComposePopupPage";

export const Route = createFileRoute("/incident-compose")({
  component: IncidentComposePopupRoute,
});

function IncidentComposePopupRoute() {
  return <IncidentComposePopupPage />;
}
