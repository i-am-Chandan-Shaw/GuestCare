import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/shared/components/AppLayout";
import { CallWorkspace } from "@/features/workspace/components/CallWorkspace";

export const Route = createFileRoute("/")({
  component: CustomersRoute,
});

function CustomersRoute() {
  return (
    <AppLayout>
      <CallWorkspace />
    </AppLayout>
  );
}
