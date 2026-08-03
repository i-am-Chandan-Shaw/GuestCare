import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { IncidentComposeShell } from "@/features/incidents/components/IncidentComposeShell";
import { CallWorkspace } from "@/features/workspace";
import { WorkspaceProvider } from "@/features/workspace/context/WorkspaceProvider";

const searchSchema = z.object({
  customerId: z.string().optional(),
  propertyId: z.string().optional(),
  issueId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/_shell/")({
  validateSearch: searchSchema,
  component: CustomersRoute,
});

function CustomersRoute() {
  return (
    <WorkspaceProvider>
      <CallWorkspace />
      <IncidentComposeShell />
    </WorkspaceProvider>
  );
}
