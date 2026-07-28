import { useMemo } from "react";
import { useIncidentLogs } from "@/features/incidents/hooks/useIncidents";
import type { IncidentLog } from "@/shared/types";

export type ReportStatusFilter = "all" | "open" | "resolved";

export function useReports(customerId?: string) {
  const filters = useMemo(() => ({ customerId }), [customerId]);
  return useIncidentLogs(filters);
}

export function filterReports(
  logs: IncidentLog[],
  search: string,
  status: ReportStatusFilter,
): IncidentLog[] {
  const query = search.trim().toLowerCase();
  return logs.filter((log) => {
    const matchesStatus =
      status === "all" ||
      (status === "open" && log.status !== "Resolved") ||
      (status === "resolved" && log.status === "Resolved");

    if (!matchesStatus) return false;
    if (!query) return true;

    const haystack = [
      log.issueSummary,
      log.propertyLabel,
      log.agent,
      log.callerName,
      log.incidentType,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}
