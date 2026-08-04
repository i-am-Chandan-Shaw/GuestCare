import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { canManageAgents } from "@/features/agents/lib/agent-permissions";

export const Route = createFileRoute("/_authenticated/_shell/directory")({
  beforeLoad: ({ context }) => {
    const auth = context.auth;
    if (!auth) {
      throw redirect({ to: "/login" });
    }
    if (!canManageAgents(auth.agent)) {
      throw redirect({ to: "/" });
    }
  },
  component: DirectoryLayout,
});

function DirectoryLayout() {
  return <Outlet />;
}
