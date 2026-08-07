import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAgents } from "@/features/agents/hooks/useAgents";
import { useCustomerSummaries } from "@/features/customers/hooks/useCustomers";
import {
  EMPTY_REPORTS_LIST_FILTERS,
  type ReportsListFilters,
} from "@/features/reports/lib/reports-list-filters";
import { getPropertySummaries } from "@/features/customers/api/customers.api";
import { queryKeys } from "@/shared/lib/query-keys";

export type AccordionKey =
  "status" | "priority" | "agent" | "customer" | "property" | "issueType" | "dateRange";

export function cloneFilters(filters: ReportsListFilters): ReportsListFilters {
  return {
    search: filters.search,
    statuses: [...filters.statuses],
    priorities: [...filters.priorities],
    assignedAgentIds: [...filters.assignedAgentIds],
    customerIds: [...filters.customerIds],
    propertyIds: [...filters.propertyIds],
    issueTypes: [...filters.issueTypes],
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };
}

/** Popover draft keeps search from applied (search is edited outside). */
export function draftFromApplied(applied: ReportsListFilters): ReportsListFilters {
  return {
    ...cloneFilters(EMPTY_REPORTS_LIST_FILTERS),
    ...cloneFilters(applied),
    search: applied.search,
  };
}

export function selectedCountBadge(count: number): string {
  return `${count} selected`;
}

export function dateRangeBadge(dateFrom: string, dateTo: string): string {
  if (!dateFrom && !dateTo) return "Not set";
  if (dateFrom && dateTo) return "Set";
  return "1 selected";
}

export function useReportsFiltersState(applied: ReportsListFilters) {
  const [draft, setDraft] = useState<ReportsListFilters>(() => draftFromApplied(applied));
  const [expanded, setExpanded] = useState<AccordionKey | null>("status");
  const [agentQ, setAgentQ] = useState("");
  const [customerQ, setCustomerQ] = useState("");
  const [propertyQ, setPropertyQ] = useState("");

  const { data: agents = [] } = useAgents();
  const { data: customers = [] } = useCustomerSummaries();

  const filteredAgents = useMemo(() => {
    const q = agentQ.trim().toLowerCase();
    return [...agents]
      .filter((a) => a.isActive)
      .filter((a) => !q || a.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [agents, agentQ]);

  const filteredCustomers = useMemo(() => {
    const q = customerQ.trim().toLowerCase();
    return [...customers]
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, customerQ]);

  const customerIds = useMemo(
    () => customers.map((c) => c.id),
    [customers],
  );

  const { data: allProperties = [] } = useQuery({
    queryKey: [...queryKeys.properties.all, "filter-all", ...customerIds],
    queryFn: async () => {
      const batches = await Promise.all(
        customerIds.map((id) => getPropertySummaries(id)),
      );
      return batches.flat();
    },
    enabled: customerIds.length > 0,
  });

  const filteredProperties = useMemo(() => {
    const q = propertyQ.trim().toLowerCase();
    return [...allProperties]
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allProperties, propertyQ]);

  const toggleAccordion = (key: AccordionKey) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  const patch = (partial: Partial<ReportsListFilters>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  return {
    draft,
    setDraft,
    expanded,
    setExpanded,
    agentQ,
    setAgentQ,
    customerQ,
    setCustomerQ,
    propertyQ,
    setPropertyQ,
    filteredAgents,
    filteredCustomers,
    filteredProperties,
    toggleAccordion,
    patch,
  };
}
