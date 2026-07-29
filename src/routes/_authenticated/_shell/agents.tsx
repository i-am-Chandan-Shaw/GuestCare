import { createFileRoute } from "@tanstack/react-router";
import { AgentsPage } from "@/features/agents";

export const Route = createFileRoute("/_authenticated/_shell/agents")({
  component: AgentsRoute,
});

function AgentsRoute() {
  return <AgentsPage />;
}
