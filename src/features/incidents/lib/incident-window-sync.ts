import type { FormState } from "@/features/incidents/components/incident-form.types";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";

export const INCIDENT_POPUP_WINDOW_NAME = "guestcare-incident-compose";
export const INCIDENT_WINDOW_SYNC_CHANNEL = "guestcare-workspace";

export type IncidentPanelMode = "closed" | "expanded" | "minimized" | "detached";

export type IncidentWindowState = {
  form: FormState;
  phase: WorkspacePhase;
  customerId: string | null;
  propertyId: string | null;
  issueId: string | null;
  checked: Record<string, boolean>;
  verificationChecked: Record<string, boolean>;
  outcome: "resolve" | "escalate" | null;
  panelMode: IncidentPanelMode;
  detached: boolean;
};

export type IncidentSyncMessage =
  | { type: "SYNC_FULL"; snapshot: IncidentWindowState; sourceId: string }
  | { type: "SYNC_PATCH"; patch: Partial<IncidentWindowState>; sourceId: string }
  | { type: "DETACH"; sourceId: string }
  | { type: "ATTACH"; sourceId: string }
  | { type: "SUBMIT_SUCCESS"; sourceId: string }
  | { type: "REQUEST_FULL"; sourceId: string };

export type IncidentSyncMessageInput =
  | { type: "SYNC_FULL"; snapshot: IncidentWindowState }
  | { type: "SYNC_PATCH"; patch: Partial<IncidentWindowState> }
  | { type: "DETACH" }
  | { type: "ATTACH" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "REQUEST_FULL" };

export function isIncidentPopupWindow() {
  return typeof window !== "undefined" && window.name === INCIDENT_POPUP_WINDOW_NAME;
}

export function openIncidentPopupWindow() {
  if (typeof window === "undefined") return null;
  return window.open(
    "/incident-compose",
    INCIDENT_POPUP_WINDOW_NAME,
    "popup=yes,width=420,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes",
  );
}

export function createIncidentWindowSync() {
  const sourceId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sync-${Math.random().toString(36).slice(2)}`;

  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(INCIDENT_WINDOW_SYNC_CHANNEL)
      : null;

  const listeners = new Set<(message: IncidentSyncMessage) => void>();
  let closed = false;

  if (channel) {
    channel.onmessage = (event) => {
      const message = event.data as IncidentSyncMessage;
      if (message.sourceId === sourceId) return;
      listeners.forEach((listener) => listener(message));
    };
  }

  return {
    sourceId,
    subscribe(listener: (message: IncidentSyncMessage) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    post(message: IncidentSyncMessageInput) {
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

export function watchIncidentPopupClosed(popup: Window, onClosed: () => void) {
  const interval = window.setInterval(() => {
    if (popup.closed) {
      window.clearInterval(interval);
      onClosed();
    }
  }, 400);
  return () => window.clearInterval(interval);
}
