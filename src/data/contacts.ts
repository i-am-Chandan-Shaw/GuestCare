import type { EscalationContactId, GlobalContact, HostContact } from "@/shared/types";

export const GLOBAL_CONTACTS: GlobalContact[] = [
  {
    id: "cleaning",
    name: "Cleaning Emergency Contact",
    details: "Opago Cleaning Services — available 6pm–8pm for emergency cleaning / missing linen",
    phones: ["+1 555-0199", "+1 555-0198"],
  },
  {
    id: "next-day",
    name: "Stay in London - Next Day Follow up",
    details: "Tag Dainius and Casey on Slack for their review the following day",
  },
  {
    id: "property",
    name: "Escalation Contact Depends on Property",
    details: "Go to Emergency Contacts / property hosts for the selected property",
  },
];

/** Hosts keyed by property id (normalized SIL slug) */
export const PROPERTY_HOSTS: Record<string, HostContact[]> = {
  almorah: [{ name: "Claire", phone: "+1 555-0101" }],
  battersea: [{ name: "Faisal", phone: "+1 555-0102" }],
  "bedford-c": [{ name: "Ben", phone: "+1 555-0103" }],
  "bedford-d": [{ name: "Adam", phone: "+1 555-0104" }],
  bermondsey: [{ name: "Monica", phone: "+1 555-0105" }],
  borough: [{ name: "Richard", phone: "+1 555-0106" }],
  "chalk-farm": [{ name: "Amit", phone: "+1 555-0107" }],
  clerkenwell: [
    { name: "Carol", phone: "+1 555-0108" },
    { name: "Louis", phone: "+1 555-0109" },
    { name: "Kira", phone: "+1 555-0100" },
  ],
  "exchange-gardens": [
    { name: "Sajal", phone: "+1 555-0101" },
    { name: "Mehak", phone: "+1 555-0102" },
  ],
  farringdon: [
    { name: "Julie", phone: "+1 555-0103" },
    { name: "Paul", phone: "+1 555-0104" },
  ],
  fulham: [{ name: "Gela", phone: "+1 555-0105" }],
  hampstead: [{ name: "Host", phone: "+1 555-0106" }],
  marylebone: [
    { name: "Marianne", phone: "+1 555-0107" },
    { name: "David", phone: "+1 555-0108" },
  ],
  mayfair: [
    { name: "Julie", phone: "+1 555-0109" },
    { name: "Gegg", phone: "+1 555-0100" },
  ],
  neckinger: [{ name: "Peter", phone: "+1 555-0101" }],
  "notting-hill": [
    { name: "Lisa", phone: "+1 555-0102" },
    { name: "Nick", phone: "+1 555-0103" },
  ],
  "paddington-11": [
    { name: "Rory", phone: "+1 555-0104" },
    { name: "Nancy", phone: "+1 555-0105" },
    { name: "Office Renaissance", phone: "+1 555-0106" },
  ],
  "paddington-12": [
    { name: "Rory", phone: "+1 555-0107" },
    { name: "Nancy", phone: "+1 555-0108" },
    { name: "Office Renaissance", phone: "+1 555-0109" },
  ],
  pembridge: [
    { name: "Uttam", phone: "+1 555-0100" },
    { name: "Clare", phone: "+1 555-0101" },
  ],
  "royal-oak": [{ name: "Peyman", phone: "+1 555-0102" }],
  "third-avenue": [{ name: "Jacqueline", phone: "+1 555-0103" }],
  "union-street": [
    { name: "Dario", phone: "+1 555-0104" },
    { name: "Tiz", phone: "+1 555-0105" },
  ],
  vauxhall: [{ name: "Dainius", phone: "+1 555-0106" }],
  "shepherds-bush": [
    { name: "Alejo", phone: "+1 555-0107" },
    { name: "Isabel", phone: "+1 555-0108" },
  ],
};

export function getGlobalContact(id: EscalationContactId | string): GlobalContact | undefined {
  return GLOBAL_CONTACTS.find((c) => c.id === id);
}

export function getPropertyHosts(propertyId: string): HostContact[] {
  return PROPERTY_HOSTS[propertyId] ?? [];
}
