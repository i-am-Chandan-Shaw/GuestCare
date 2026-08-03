import type { FormState } from "@/features/incidents/components/incident-form.types";
import type { IncidentPanelMode } from "@/features/incidents/lib/incident-window-sync";
import type { WorkspacePhase } from "@/features/workspace/lib/workspace-state";
import type { WorkspaceSearch } from "@/features/workspace/lib/workspace-url";

const WORKSPACE_KEY = "gc_workspace_v1";
/** v2 drops drafts that were auto-filled from protocol steps / action chips. */
const COMPOSE_KEY = "gc_incident_compose_v2";
const LEGACY_COMPOSE_KEYS = ["gc_incident_compose_v1"] as const;

export type PersistedWorkspaceState = {
  phase: WorkspacePhase;
  customerId: string | null;
  propertyId: string | null;
  issueId: string | null;
  checked: Record<string, boolean>;
  verificationChecked: Record<string, boolean>;
  outcome: "resolve" | "escalate" | null;
};

export type PersistedComposeState = {
  form: FormState;
  panelMode: IncidentPanelMode;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readPersistedWorkspace(): PersistedWorkspaceState | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(WORKSPACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedWorkspaceState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePersistedWorkspace(state: PersistedWorkspaceState): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function clearPersistedWorkspace(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(WORKSPACE_KEY);
  } catch {
    /* ignore */
  }
}

export function workspaceSearchFromPersisted(
  persisted: PersistedWorkspaceState | null,
): WorkspaceSearch {
  if (!persisted?.customerId) return {};
  return {
    customerId: persisted.customerId,
    ...(persisted.propertyId ? { propertyId: persisted.propertyId } : {}),
    ...(persisted.issueId ? { issueId: persisted.issueId } : {}),
  };
}

export function readIncidentsNavSearch(): WorkspaceSearch {
  return workspaceSearchFromPersisted(readPersistedWorkspace());
}

export function readPersistedCompose(): PersistedComposeState | null {
  if (!canUseStorage()) return null;
  try {
    for (const key of LEGACY_COMPOSE_KEYS) {
      window.localStorage.removeItem(key);
    }
    const raw = window.localStorage.getItem(COMPOSE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedComposeState;
    if (!parsed?.form || typeof parsed.form !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePersistedCompose(state: PersistedComposeState): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(COMPOSE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function clearPersistedCompose(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(COMPOSE_KEY);
  } catch {
    /* ignore */
  }
}
