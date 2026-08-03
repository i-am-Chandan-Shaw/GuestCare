import type { Customer } from "@/shared/types";

export const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Stay in London — South",
    email: "south@stayinlondon.co.uk",
    phone: "+1 555-0201",
    propertyIds: ["almorah", "battersea", "bermondsey", "borough", "neckinger", "union-street", "vauxhall"],
  },
  {
    id: "c2",
    name: "Stay in London — Central",
    email: "central@stayinlondon.co.uk",
    phone: "+1 555-0202",
    propertyIds: ["bedford-c", "bedford-d", "clerkenwell", "farringdon", "marylebone", "mayfair"],
  },
  {
    id: "c3",
    name: "Renaissance Paddington",
    email: "ops@renaissancepad.com",
    phone: "+1 555-0203",
    propertyIds: ["paddington-11", "paddington-12", "exchange-gardens"],
  },
  {
    id: "c4",
    name: "West London Hosts",
    email: "hosts@westlondonstays.com",
    phone: "+1 555-0204",
    propertyIds: ["fulham", "notting-hill", "pembridge", "royal-oak", "shepherds-bush"],
  },
  {
    id: "c5",
    name: "North & Heath Portfolio",
    email: "desk@northheath.co.uk",
    phone: "+1 555-0205",
    propertyIds: ["chalk-farm", "hampstead", "third-avenue"],
  },
];
