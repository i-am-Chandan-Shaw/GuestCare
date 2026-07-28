import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/shared/components/AppLayout";
import { AgentsPage } from "@/features/agents/components/AgentsPage";

export const Route = createFileRoute("/agents")({
  component: AgentsRoute,
});

function AgentsRoute() {
  return (
    <AppLayout>
      <AgentsPage />
    </AppLayout>
  );
}
