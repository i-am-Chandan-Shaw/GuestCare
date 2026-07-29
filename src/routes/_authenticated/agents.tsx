import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/shared/components/AppLayout";
import { AgentsPage } from "@/features/agents";

export const Route = createFileRoute("/_authenticated/agents")({
  component: AgentsRoute,
});

function AgentsRoute() {
  return (
    <AppLayout>
      <AgentsPage />
    </AppLayout>
  );
}
