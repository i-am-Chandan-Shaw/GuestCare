import type { Agent, AgentAccess } from "@/shared/types/agent";
import { normalizeAgentAccess } from "@/features/auth/lib/normalize-agent";
import { reportHasAssignee } from "@/features/reports/lib/report-assignees";
import { agentCanAccessCustomer } from "@/shared/lib/access";
import type { Report } from "@/shared/types/report";

export { agentCanAccessCustomer };

export function toAgentAccess(agent: Agent | AgentAccess | unknown): AgentAccess {
  const normalized = normalizeAgentAccess(agent);
  return {
    id: normalized.id,
    name: normalized.name,
    role: normalized.role,
    customerScope: normalized.customerScope,
  };
}

export function filterReportsForAgent(reports: Report[], currentAgent?: AgentAccess): Report[] {
  if (!currentAgent || currentAgent.role === "admin") return reports;
  return reports.filter((r) => agentCanAccessCustomer(currentAgent, r.customerId));
}

export function agentCanEditReport(currentAgent: AgentAccess, report: Report): boolean {
  if (!agentCanAccessCustomer(currentAgent, report.customerId)) return false;
  if (currentAgent.role === "admin" || currentAgent.role === "manager") return true;
  return reportHasAssignee(report, currentAgent.id);
}

export function agentCanAssignReport(currentAgent: AgentAccess, report: Report): boolean {
  return currentAgent.role !== "user" && agentCanAccessCustomer(currentAgent, report.customerId);
}
