import {
  getWorkspaceCustomerFn,
  getWorkspacePropertyFn,
  listWorkspaceCustomerSummariesFn,
  listWorkspacePropertySummariesFn,
} from "@/features/workspace/workspace.functions";
import type {
  Customer,
  CustomerSummary,
  Property,
  PropertySummary,
} from "@/shared/types";


export async function getCustomerById(customerId: string): Promise<Customer | null> {
  return getWorkspaceCustomerFn({ data: { id: customerId } });
}

export async function getPropertyById(propertyId: string): Promise<Property | null> {
  return getWorkspacePropertyFn({ data: { id: propertyId } });
}

export async function getCustomerSummaries(): Promise<CustomerSummary[]> {
  return listWorkspaceCustomerSummariesFn();
}

export async function getPropertySummaries(customerId: string): Promise<PropertySummary[]> {
  return listWorkspacePropertySummariesFn({ data: { customerId } });
}

export async function getPropertySummary(
  customerId: string,
  propertyId: string,
): Promise<PropertySummary | null> {
  const summaries = await getPropertySummaries(customerId);
  return summaries.find((property) => property.id === propertyId) ?? null;
}
