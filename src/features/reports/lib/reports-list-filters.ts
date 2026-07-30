import type { Priority } from "@/shared/types";
import type { ReportStatus, ReportsQuery } from "@/shared/types/report";

export interface ReportsListFilters {
  search: string;
  statuses: ReportStatus[];
  priorities: Priority[];
  assignedAgentIds: string[];
  customerIds: string[];
  propertyIds: string[];
  issueTypes: string[];
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_REPORTS_LIST_FILTERS: ReportsListFilters = {
  search: "",
  statuses: [],
  priorities: [],
  assignedAgentIds: [],
  customerIds: [],
  propertyIds: [],
  issueTypes: [],
  dateFrom: "",
  dateTo: "",
};

/** Count of selected filter values in the Filters popover (excludes external search). */
export function countActiveReportsFilters(filters: ReportsListFilters): number {
  let count = 0;
  count += filters.statuses.length;
  count += filters.priorities.length;
  count += filters.assignedAgentIds.length;
  count += filters.customerIds.length;
  count += filters.propertyIds.length;
  count += filters.issueTypes.length;
  if (filters.dateFrom || filters.dateTo) count += 1;
  return count;
}

export function reportsListFiltersToQuery(
  filters: ReportsListFilters,
  pageScope: { page: number; limit: number; customerId?: string },
): ReportsQuery {
  const search = filters.search.trim();
  return {
    page: pageScope.page,
    limit: pageScope.limit,
    customerId: pageScope.customerId,
    search: search || undefined,
    statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
    priorities: filters.priorities.length > 0 ? filters.priorities : undefined,
    assignedAgentIds:
      filters.assignedAgentIds.length > 0 ? filters.assignedAgentIds : undefined,
    customerIds:
      !pageScope.customerId && filters.customerIds.length > 0
        ? filters.customerIds
        : undefined,
    propertyIds: filters.propertyIds.length > 0 ? filters.propertyIds : undefined,
    issueTypes: filters.issueTypes.length > 0 ? filters.issueTypes : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  };
}

export function toggleIdInList<T extends string>(list: T[], id: T): T[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}
