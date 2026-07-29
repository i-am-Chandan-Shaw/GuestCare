import type { FormState } from "@/features/copilot/components/incident-form.types";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";

export const COMPOSE_POPUP_NAME = "guestcare-incident-compose";
export const WORKSPACE_CHANNEL = "guestcare-workspace";

export type ComposeMode = "closed" | "expanded" | "minimized" | "detached";

export type WorkspaceSnapshot = {
  form: FormState;
  phase: WorkspacePhase;
  customerId: string | null;
  propertyId: string | null;
  issueId: string | null;
  checked: Record<string, boolean>;
  verificationChecked: Record<string, boolean>;
  outcome: "resolve" | "escalate" | null;
  composeMode: ComposeMode;
  detached: boolean;
};

export type SyncMessage =
  | { type: "SYNC_FULL"; snapshot: WorkspaceSnapshot; sourceId: string }
  | { type: "SYNC_PATCH"; patch: Partial<WorkspaceSnapshot>; sourceId: string }
  | { type: "DETACH"; sourceId: string }
  | { type: "ATTACH"; sourceId: string }
  | { type: "SUBMIT_SUCCESS"; sourceId: string }
  | { type: "REQUEST_FULL"; sourceId: string };

export type SyncMessageInput =
  | { type: "SYNC_FULL"; snapshot: WorkspaceSnapshot }
  | { type: "SYNC_PATCH"; patch: Partial<WorkspaceSnapshot> }
  | { type: "DETACH" }
  | { type: "ATTACH" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "REQUEST_FULL" };

export function isComposePopupWindow() {
  return typeof window !== "undefined" && window.name === COMPOSE_POPUP_NAME;
}

export function openComposePopup() {
  if (typeof window === "undefined") return null;
  return window.open(
    "/incident-compose",
    COMPOSE_POPUP_NAME,
    "popup=yes,width=420,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes",
  );
}

export function createWorkspaceSync() {
  const sourceId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sync-${Math.random().toString(36).slice(2)}`;

  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(WORKSPACE_CHANNEL)
      : null;

  const listeners = new Set<(message: SyncMessage) => void>();
  let closed = false;

  if (channel) {
    channel.onmessage = (event) => {
      const message = event.data as SyncMessage;
      if (message.sourceId === sourceId) return;
      listeners.forEach((listener) => listener(message));
    };
  }

  return {
    sourceId,
    subscribe(listener: (message: SyncMessage) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    post(message: SyncMessageInput) {
      if (closed || !channel) return;
      try {
        channel.postMessage({ ...message, sourceId });
      } catch {
        closed = true;
      }
    },
    close() {
      if (closed) return;
      closed = true;
      channel?.close();
    },
  };
}

export function watchPopupClosed(popup: Window, onClosed: () => void) {
  const interval = window.setInterval(() => {
    if (popup.closed) {
      window.clearInterval(interval);
      onClosed();
    }
  }, 400);
  return () => window.clearInterval(interval);
}
