import { CUSTOMERS } from "@/data/mock";
import { PROPERTIES } from "@/data/properties";
import { getIncidentLogs } from "@/features/incidents/api/incidents.api";
import type {
  Customer,
  CustomerSummary,
  IncidentLog,
  LastIssueSummary,
  Property,
  PropertySummary,
} from "@/shared/types";

import { isOpenIncident } from "@/shared/lib/incident-status";
function toLastIssue(log: IncidentLog): LastIssueSummary {
  return {
    summary: log.issueSummary,
    propertyLabel: log.propertyLabel,
    timestamp: log.timestamp,
    priority: log.priority,
  };
}

function summarizeCustomer(customer: Customer, logs: IncidentLog[]): CustomerSummary {
  const propertyIds = new Set(customer.propertyIds);
  const customerLogs = logs.filter(
    (log) =>
      (log.customerId && log.customerId === customer.id) ||
      (log.propertyId && propertyIds.has(log.propertyId)),
  );
  const openReportsCount = customerLogs.filter(isOpenIncident).length;
  const resolvedCount = customerLogs.filter((log) => log.status === "Resolved").length;
  const criticalOpenCount = customerLogs.filter(
    (log) => isOpenIncident(log) && log.priority === "P1",
  ).length;
  const lastIssue = customerLogs[0] ? toLastIssue(customerLogs[0]) : undefined;

  return {
    ...customer,
    propertyCount: customer.propertyIds.length,
    openReportsCount,
    resolvedCount,
    totalIssuesCount: customerLogs.length,
    criticalOpenCount,
    lastIssue,
  };
}

function summarizeProperty(property: Property, logs: IncidentLog[]): PropertySummary {
  const propertyLogs = logs.filter((log) => log.propertyId === property.id);
  const openReportsCount = propertyLogs.filter(isOpenIncident).length;
  const resolvedCount = propertyLogs.filter((log) => log.status === "Resolved").length;
  const lastLog = propertyLogs[0];
  const lastIssue = lastLog
    ? {
        summary: lastLog.issueSummary,
        timestamp: lastLog.timestamp,
        priority: lastLog.priority,
      }
    : undefined;

  return {
    ...property,
    openReportsCount,
    resolvedCount,
    lastIssue,
  };
}

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  return CUSTOMERS.find((c) => c.id === customerId) ?? null;
}

export async function getPropertyById(propertyId: string): Promise<Property | null> {
  return PROPERTIES.find((p) => p.id === propertyId) ?? null;
}

export async function getCustomerSummaries(): Promise<CustomerSummary[]> {
  const logs = await getIncidentLogs();
  return CUSTOMERS.map((customer) => summarizeCustomer(customer, logs));
}

export async function getCustomerSummary(customerId: string): Promise<CustomerSummary | null> {
  const customer = CUSTOMERS.find((c) => c.id === customerId);
  if (!customer) return null;
  const logs = await getIncidentLogs({ customerId });
  return summarizeCustomer(customer, logs);
}

export async function getPropertySummaries(customerId: string): Promise<PropertySummary[]> {
  const customer = CUSTOMERS.find((c) => c.id === customerId);
  if (!customer) return [];
  const properties = PROPERTIES.filter((p) => customer.propertyIds.includes(p.id));
  const logs = await getIncidentLogs({ customerId });
  return properties.map((property) => summarizeProperty(property, logs));
}

export async function getPropertySummary(
  customerId: string,
  propertyId: string,
): Promise<PropertySummary | null> {
  const summaries = await getPropertySummaries(customerId);
  return summaries.find((p) => p.id === propertyId) ?? null;
}
