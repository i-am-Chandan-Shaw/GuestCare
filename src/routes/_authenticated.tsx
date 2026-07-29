import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "@/features/auth/lib/require-auth";
import { WorkspaceProvider } from "@/features/workspace/context/WorkspaceProvider";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    requireAuth(context.auth, location.href);
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <WorkspaceProvider>
      <Outlet />
    </WorkspaceProvider>
  );
}
