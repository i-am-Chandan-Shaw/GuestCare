import { createFileRoute, redirect } from "@tanstack/react-router";
import { AgentsPage } from "@/features/agents";
import { canManageAgents } from "@/features/agents/lib/agent-permissions";

export const Route = createFileRoute("/_authenticated/_shell/agents")({
  beforeLoad: ({ context }) => {
    const auth = context.auth;
    if (!auth) {
      throw redirect({ to: "/login" });
    }
    if (!canManageAgents(auth.agent)) {
      throw redirect({ to: "/" });
    }
  },
  component: AgentsRoute,
});

function AgentsRoute() {
  return <AgentsPage />;
}
