import { CUSTOMERS } from "@/data/mock";
import { PROPERTIES } from "@/data/properties";
import type { Customer, Property } from "@/shared/types";

export async function getCustomers(): Promise<Customer[]> {
  return CUSTOMERS;
}

export async function getCustomerById(customerId: string): Promise<Customer | null> {
  return CUSTOMERS.find((c) => c.id === customerId) ?? null;
}

export async function getPropertiesByCustomerId(customerId: string): Promise<Property[]> {
  const customer = await getCustomerById(customerId);
  if (!customer) return [];
  return PROPERTIES.filter((p) => customer.propertyIds.includes(p.id));
}

export async function getPropertyById(propertyId: string): Promise<Property | null> {
  return PROPERTIES.find((p) => p.id === propertyId) ?? null;
}
