export * from "./types";
export * from "./contacts";
export { PROPERTIES, FAVORITE_PROPERTY_IDS, getPropertyAccessCode } from "./properties";
export { ISSUES, RECENT_ISSUE_IDS } from "./protocols";
export { INCIDENT_LOGS, RECENT_INCIDENTS } from "./incidents";

import type { Customer, Priority } from "./types";

export const AGENT = {
  name: "Priya Ramanathan",
  handle: "@priya",
  initials: "PR",
  role: "Senior Support Agent",
  shift: "EU · 14:00–22:00",
};

export const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Stay in London — South",
    email: "south@stayinlondon.co.uk",
    phone: "+44 20 3865 0599",
    propertyIds: ["almorah", "battersea", "bermondsey", "borough", "neckinger", "union-street", "vauxhall"],
  },
  {
    id: "c2",
    name: "Stay in London — Central",
    email: "central@stayinlondon.co.uk",
    phone: "+44 20 3865 0600",
    propertyIds: ["bedford-c", "bedford-d", "clerkenwell", "farringdon", "marylebone", "mayfair"],
  },
  {
    id: "c3",
    name: "Renaissance Paddington",
    email: "ops@renaissancepad.com",
    phone: "+44 7477 906899",
    propertyIds: ["paddington-11", "paddington-12", "exchange-gardens"],
  },
  {
    id: "c4",
    name: "West London Hosts",
    email: "hosts@westlondonstays.com",
    phone: "+44 20 7946 0123",
    propertyIds: ["fulham", "notting-hill", "pembridge", "royal-oak", "shepherds-bush"],
  },
  {
    id: "c5",
    name: "North & Heath Portfolio",
    email: "desk@northheath.co.uk",
    phone: "+44 20 7946 0456",
    propertyIds: ["chalk-farm", "hampstead", "third-avenue"],
  },
];

export const priorityMeta: Record<Priority, { label: string; tone: string; dot: string }> = {
  P1: { label: "P1 · Critical", tone: "bg-destructive/15 text-destructive border-destructive/30", dot: "bg-destructive" },
  P2: { label: "P2 · High", tone: "bg-warning/10 text-warning border-warning/30", dot: "bg-warning" },
  P3: { label: "P3 · Medium", tone: "bg-info/10 text-info border-info/30", dot: "bg-info" },
  P4: { label: "P4 · Low", tone: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
};
