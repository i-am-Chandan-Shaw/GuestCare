import type { Agent, ReportActor } from "@/shared/types/agent";
import { normalizeReportActor } from "@/features/auth/lib/normalize-agent";
import { reportHasAssignee } from "@/features/reports/lib/report-assignees";
import type { Report } from "@/shared/types/report";

export function toReportActor(agent: Agent | ReportActor | unknown): ReportActor {
  const normalized = normalizeReportActor(agent);
  return {
    id: normalized.id,
    name: normalized.name,
    role: normalized.role,
    customerScope: normalized.customerScope,
  };
}

export function agentCanAccessCustomer(actor: ReportActor, customerId: string): boolean {
  if (actor.role === "admin") return true;
  if (!actor.customerScope) return true;
  if (actor.customerScope.type === "all") return true;
  return actor.customerScope.customerIds.includes(customerId);
}

export function filterReportsByActor(reports: Report[], actor?: ReportActor): Report[] {
  if (!actor || actor.role === "admin") return reports;
  return reports.filter((r) => agentCanAccessCustomer(actor, r.customerId));
}

export function agentCanEditReport(actor: ReportActor, report: Report): boolean {
  if (actor.role === "admin" || actor.role === "manager") {
    return agentCanAccessCustomer(actor, report.customerId);
  }
  return (
    reportHasAssignee(report, actor.id) &&
    agentCanAccessCustomer(actor, report.customerId)
  );
}

export function agentCanAssignReport(actor: ReportActor, report: Report): boolean {
  if (actor.role === "user") return false;
  return agentCanAccessCustomer(actor, report.customerId);
}
