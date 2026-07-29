import { ISSUES, RECENT_ISSUE_IDS } from "@/data/protocols";
import { getGlobalContact } from "@/data/contacts";
import { getPropertyAccessCode } from "@/data/properties";
import type { EscalationContactId, Issue, Property, SuggestedIssue } from "@/shared/types";
import { getIncidentLogs } from "@/features/incidents/api/incidents.api";

export async function getIssues(): Promise<Issue[]> {
  return ISSUES;
}

export async function getIssueById(issueId: string): Promise<Issue | null> {
  return ISSUES.find((i) => i.id === issueId) ?? null;
}

export async function getRecentIssueIds(): Promise<string[]> {
  return RECENT_ISSUE_IDS;
}

export async function fetchGlobalContact(id: EscalationContactId | string) {
  return getGlobalContact(id);
}

export async function fetchPropertyAccessCode(property: Property): Promise<string | undefined> {
  return getPropertyAccessCode(property);
}

export async function getSuggestedIssues(propertyId: string): Promise<SuggestedIssue[]> {
  const logs = await getIncidentLogs({ propertyId, limit: 20 });
  const seen = new Set<string>();
  const suggested: SuggestedIssue[] = [];

  for (const id of RECENT_ISSUE_IDS) {
    const issue = ISSUES.find((i) => i.id === id);
    if (issue && !seen.has(issue.id)) {
      suggested.push({ issue, reason: "recent" });
      seen.add(issue.id);
    }
  }

  for (const log of logs) {
    if (!log.protocolIssueId || seen.has(log.protocolIssueId)) continue;
    const issue = ISSUES.find((i) => i.id === log.protocolIssueId);
    if (issue) {
      suggested.push({ issue, reason: "history" });
      seen.add(issue.id);
    }
  }

  return suggested.slice(0, 8);
}
