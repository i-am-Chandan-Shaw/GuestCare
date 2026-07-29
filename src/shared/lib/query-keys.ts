export const queryKeys = {
  customers: {
    all: ["customers"] as const,
    summaries: () => [...queryKeys.customers.all, "summaries"] as const,
    detail: (id: string) => [...queryKeys.customers.all, "detail", id] as const,
  },
  properties: {
    all: ["properties"] as const,
    byCustomer: (customerId: string) => [...queryKeys.properties.all, "customer", customerId] as const,
    summaries: (customerId: string) => [...queryKeys.properties.all, "summaries", customerId] as const,
  },
  issues: {
    all: ["issues"] as const,
    recent: () => [...queryKeys.issues.all, "recent"] as const,
    suggested: (propertyId: string) => [...queryKeys.issues.all, "suggested", propertyId] as const,
  },
  contacts: {
    detail: (id: string) => ["contacts", id] as const,
  },
  incidents: {
    all: ["incidents"] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.incidents.all, "list", filters] as const,
  },
  agents: {
    all: ["agents"] as const,
  },
};
