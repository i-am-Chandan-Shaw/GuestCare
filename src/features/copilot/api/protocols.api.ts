import { ISSUES } from "@/mock-data/protocols";
import { getGlobalContact } from "@/mock-data/contacts";
import type { EscalationContactId, Issue } from "@/shared/types";

export async function getIssues(): Promise<Issue[]> {
  return ISSUES;
}

export async function getIssueById(issueId: string): Promise<Issue | null> {
  return ISSUES.find((i) => i.id === issueId) ?? null;
}

export async function fetchGlobalContact(id: EscalationContactId | string) {
  return getGlobalContact(id);
}
