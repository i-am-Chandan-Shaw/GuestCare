import type { Agent, ReportActor } from "@/shared/types/agent";
import { normalizeReportActor } from "@/features/auth/lib/normalize-agent";
import { reportHasAssignee } from "@/features/reports/lib/report-assignees";
import { agentCanAccessCustomer } from "@/shared/lib/access";
import type { Report } from "@/shared/types/report";

export { agentCanAccessCustomer };

export function toReportActor(agent: Agent | ReportActor | unknown): ReportActor {
  const normalized = normalizeReportActor(agent);
  return {
    id: normalized.id,
    name: normalized.name,
    role: normalized.role,
    customerScope: normalized.customerScope,
  };
}

export function filterReportsByActor(reports: Report[], actor?: ReportActor): Report[] {
  if (!actor || actor.role === "admin") return reports;
  return reports.filter((r) => agentCanAccessCustomer(actor, r.customerId));
}

export function agentCanEditReport(actor: ReportActor, report: Report): boolean {
  if (!agentCanAccessCustomer(actor, report.customerId)) return false;
  if (actor.role === "admin" || actor.role === "manager") return true;
  return reportHasAssignee(report, actor.id);
}

export function agentCanAssignReport(actor: ReportActor, report: Report): boolean {
  return actor.role !== "user" && agentCanAccessCustomer(actor, report.customerId);
}
