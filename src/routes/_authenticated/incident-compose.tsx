import { createFileRoute } from "@tanstack/react-router";
import { IncidentComposePopupPage } from "@/features/incidents/components/IncidentComposePopupPage";
import { WorkspaceProvider } from "@/features/workspace/context/WorkspaceProvider";

export const Route = createFileRoute("/_authenticated/incident-compose")({
  component: IncidentComposePopupRoute,
});

function IncidentComposePopupRoute() {
  return (
    <WorkspaceProvider>
      <IncidentComposePopupPage />
    </WorkspaceProvider>
  );
}
