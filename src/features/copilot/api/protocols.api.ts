import {
  getWorkspaceContactFn,
  getWorkspaceIssueFn,
  listWorkspaceIssuesFn,
} from "@/features/workspace/workspace.functions";
import type { EscalationContactId, GlobalContact, Issue } from "@/shared/types";

export async function getIssues(propertyId?: string): Promise<Issue[]> {
  if (!propertyId) return [];
  return listWorkspaceIssuesFn({ data: { propertyId } });
}

export async function getIssueById(issueId: string): Promise<Issue | null> {
  return getWorkspaceIssueFn({ data: { id: issueId } });
}

export async function fetchGlobalContact(
  id: EscalationContactId | string,
  customerId?: string,
): Promise<GlobalContact | null> {
  return getWorkspaceContactFn({ data: { id, customerId } });
}
