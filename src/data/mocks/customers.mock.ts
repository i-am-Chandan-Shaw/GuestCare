import type { Customer } from "@/shared/types";

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
