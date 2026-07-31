import type { Report, ReportAssignee } from "@/shared/types/report";

/** Compact list/filter label: "Ada", "Ada, Bob", "Ada, Bob +2". */
export function formatAssigneesLabel(assignees: ReportAssignee[]): string {
  if (assignees.length === 0) return "—";
  if (assignees.length === 1) return assignees[0]!.agentName;
  if (assignees.length === 2) {
    return `${assignees[0]!.agentName}, ${assignees[1]!.agentName}`;
  }
  return `${assignees[0]!.agentName}, ${assignees[1]!.agentName} +${assignees.length - 2}`;
}

/** Keep legacy singular fields in sync for list/legacy adapters. */
export function syncDerivedAssigneeFields(report: Report): void {
  const first = report.assignees[0];
  report.assignedAgentId = first?.agentId ?? "";
  report.assignedAgentName = formatAssigneesLabel(report.assignees);
}

export function ensureAssignees(report: Report): ReportAssignee[] {
  if (report.assignees?.length) return report.assignees;
  if (report.assignedAgentId) {
    return [
      {
        agentId: report.assignedAgentId,
        agentName: report.assignedAgentName || report.assignedAgentId,
        assignedAt: report.createdAt,
        assignedByAgentId: report.createdByAgentId,
      },
    ];
  }
  return [];
}

export function reportHasAssignee(report: Report, agentId: string): boolean {
  return ensureAssignees(report).some((a) => a.agentId === agentId);
}
