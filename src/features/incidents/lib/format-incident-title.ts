import type { Customer, Property } from "@/shared/types";

export function formatIncidentTitle(customer: Customer | null, property: Property | null): string {
  if (customer && property) return `${customer.name} · ${property.name}`;
  if (customer) return customer.name;
  return "New report";
}
