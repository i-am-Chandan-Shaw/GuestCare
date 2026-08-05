import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import type { WorkspaceChecklistState } from "@/features/workspace/context/workspace.types";
import { useCallback, useRef } from "react";
import { getCustomerById, getPropertyById } from "@/features/customers/api/customers.api";
import { getIssueById } from "@/features/copilot/api/protocols.api";
import type { WorkspaceSyncPatch } from "@/features/workspace/lib/resolve-workspace-from-url";
import type {
  SelectionAction,
  ChecklistAction,
} from "@/features/workspace/context/workspace-reducers";
import type { WorkspaceSelectionState } from "@/features/workspace/context/workspace.types";

export type WorkspaceRemoteSnapshot = {
  phase: WorkspacePhase;
  customerId: string | null;
  propertyId: string | null;
  issueId: string | null;
} & WorkspaceChecklistState;

export function useWorkspaceSync({
  selection,
  dispatchSelection,
  dispatchChecklist,
}: {
  selection: WorkspaceSelectionState;
  dispatchSelection: React.Dispatch<SelectionAction>;
  dispatchChecklist: React.Dispatch<ChecklistAction>;
}) {
  const isRemoteUpdate = useRef(false);

  const applyRemotePatch = useCallback(
    async (patch: WorkspaceSyncPatch & { phase?: WorkspacePhase }) => {
      isRemoteUpdate.current = true;
      try {
        if (patch.phase !== undefined) {
          dispatchSelection({ type: "PATCH", payload: { phase: patch.phase } });
        }

        if (patch.customerId !== undefined) {
          const nextCustomer = patch.customerId ? await getCustomerById(patch.customerId) : null;
          dispatchSelection({ type: "PATCH", payload: { customer: nextCustomer } });
        }

        if (patch.propertyId !== undefined) {
          const cid = patch.customerId ?? selection.customer?.id ?? null;
          const nextCustomer = cid ? await getCustomerById(cid) : null;
          const nextProperty =
            patch.propertyId && nextCustomer ? await getPropertyById(patch.propertyId) : null;
          dispatchSelection({ type: "PATCH", payload: { property: nextProperty } });
        }

        if (patch.issueId !== undefined) {
          const nextIssue = patch.issueId ? await getIssueById(patch.issueId) : null;
          dispatchSelection({ type: "PATCH", payload: { issue: nextIssue } });
        }

        if (
          patch.checked !== undefined ||
          patch.verificationChecked !== undefined ||
          patch.outcome !== undefined
        ) {
          dispatchChecklist({
            type: "PATCH",
            payload: {
              ...(patch.checked !== undefined ? { checked: patch.checked } : {}),
              ...(patch.verificationChecked !== undefined
                ? { verificationChecked: patch.verificationChecked }
                : {}),
              ...(patch.outcome !== undefined ? { outcome: patch.outcome } : {}),
            },
          });
        }
      } finally {
        isRemoteUpdate.current = false;
      }
    },
    [selection.customer?.id, dispatchSelection, dispatchChecklist],
  );

  const applyRemoteSnapshot = useCallback(
    async (snapshot: WorkspaceRemoteSnapshot) => {
      isRemoteUpdate.current = true;
      try {
        const nextCustomer = snapshot.customerId
          ? await getCustomerById(snapshot.customerId)
          : null;

        const nextProperty =
          snapshot.propertyId && nextCustomer ? await getPropertyById(snapshot.propertyId) : null;

        const nextIssue = snapshot.issueId ? await getIssueById(snapshot.issueId) : null;

        dispatchSelection({
          type: "SET",
          payload: {
            phase: snapshot.phase,
            customer: nextCustomer,
            property: nextProperty,
            issue: nextIssue,
          },
        });

        dispatchChecklist({
          type: "SET",
          payload: {
            checked: snapshot.checked,
            verificationChecked: snapshot.verificationChecked,
            outcome: snapshot.outcome,
          },
        });
      } finally {
        isRemoteUpdate.current = false;
      }
    },
    [dispatchSelection, dispatchChecklist],
  );

  return {
    isRemoteUpdate,
    applyRemotePatch,
    applyRemoteSnapshot,
  };
}
