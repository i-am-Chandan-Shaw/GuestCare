import { useCallback } from "react";
import {
  resolveWorkspaceFromUrl,
  type WorkspaceSyncPatch,
} from "@/features/workspace/lib/resolve-workspace-from-url";
import {
  readPersistedWorkspace,
  writePersistedWorkspace,
} from "@/features/workspace/lib/workspace-persistence";
import type { WorkspaceSearch } from "@/features/workspace/lib/workspace-url";
import type { WorkspaceSelectionState } from "@/features/workspace/context/workspace.types";
import type { WorkspaceRemoteSnapshot } from "@/features/workspace/context/workspace-sync";
import type {
  SelectionAction,
  ChecklistAction,
} from "@/features/workspace/context/workspace-reducers";

export function useWorkspaceHydration({
  selection,
  dispatchSelection,
  dispatchChecklist,
  broadcastPatch,
  applyRemoteSnapshot,
}: {
  selection: WorkspaceSelectionState;
  dispatchSelection: React.Dispatch<SelectionAction>;
  dispatchChecklist: React.Dispatch<ChecklistAction>;
  broadcastPatch: (patch: WorkspaceSyncPatch) => void;
  applyRemoteSnapshot: (snapshot: WorkspaceRemoteSnapshot) => Promise<void>;
}) {
  const hydrateFromSearch = useCallback(
    async (search: WorkspaceSearch) => {
      const urlCustomerId = search.customerId ?? null;
      const urlPropertyId = search.propertyId ?? null;
      const urlIssueId = search.issueId ?? null;

      if (
        urlCustomerId === (selection.customer?.id ?? null) &&
        urlPropertyId === (selection.property?.id ?? null) &&
        urlIssueId === (selection.issue?.id ?? null)
      ) {
        return;
      }

      if (!search.customerId) {
        const persisted = readPersistedWorkspace();
        if (persisted?.customerId) {
          const matchesPersisted =
            selection.customer?.id === persisted.customerId &&
            (selection.property?.id ?? null) === persisted.propertyId &&
            (selection.issue?.id ?? null) === persisted.issueId &&
            selection.phase === persisted.phase;

          if (!matchesPersisted) {
            await applyRemoteSnapshot({
              phase: persisted.phase,
              customerId: persisted.customerId,
              propertyId: persisted.propertyId,
              issueId: persisted.issueId,
              checked: persisted.checked,
              verificationChecked: persisted.verificationChecked,
              outcome: persisted.outcome,
            });
          }
          return;
        }

        if (selection.customer) return;

        dispatchSelection({
          type: "SET",
          payload: { phase: "browse", customer: null, property: null, issue: null },
        });
        dispatchChecklist({ type: "RESET" });
        return;
      }

      const resolution = await resolveWorkspaceFromUrl(search);
      const persisted = readPersistedWorkspace();
      const sameEntities =
        !!persisted &&
        persisted.customerId === (resolution.customer?.id ?? null) &&
        (persisted.propertyId ?? null) === (resolution.property?.id ?? null) &&
        (persisted.issueId ?? null) === (resolution.issue?.id ?? null);

      const nextChecked = sameEntities ? persisted.checked : {};
      const nextVerification = sameEntities ? persisted.verificationChecked : {};
      const nextOutcome = sameEntities ? persisted.outcome : null;

      dispatchSelection({
        type: "SET",
        payload: {
          phase: resolution.phase,
          customer: resolution.customer,
          property: resolution.property,
          issue: resolution.issue,
        },
      });
      if (sameEntities) {
        dispatchChecklist({
          type: "PATCH",
          payload: {
            checked: nextChecked,
            verificationChecked: nextVerification,
            outcome: nextOutcome,
          },
        });
      } else {
        dispatchChecklist({ type: "RESET" });
      }
      broadcastPatch({
        ...resolution.syncPatch,
        checked: nextChecked,
        verificationChecked: nextVerification,
        outcome: nextOutcome,
      });

      if (resolution.customer) {
        writePersistedWorkspace({
          phase: resolution.phase,
          customerId: resolution.customer.id,
          propertyId: resolution.property?.id ?? null,
          issueId: resolution.issue?.id ?? null,
          checked: nextChecked,
          verificationChecked: nextVerification,
          outcome: nextOutcome,
        });
      }
    },
    [applyRemoteSnapshot, broadcastPatch, selection, dispatchSelection, dispatchChecklist],
  );

  return { hydrateFromSearch };
}
