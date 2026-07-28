import type { EscalationContactId, GlobalContact, HostContact } from "./types";

export const GLOBAL_CONTACTS: GlobalContact[] = [
  {
    id: "cleaning",
    name: "Cleaning Emergency Contact",
    details: "Opago Cleaning Services — available 6pm–8pm for emergency cleaning / missing linen",
    phones: ["+447481338302", "+44 (0)203 865 0599"],
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
  almorah: [{ name: "Claire", phone: "+60 12 631 9934" }],
  battersea: [{ name: "Faisal", phone: "+44 7793 558602" }],
  "bedford-c": [{ name: "Ben", phone: "+44 7776 238304" }],
  "bedford-d": [{ name: "Adam", phone: "+44 7973 668627" }],
  bermondsey: [{ name: "Monica", phone: "+44 7818 033121" }],
  borough: [{ name: "Richard", phone: "+44 7525 943580" }],
  "chalk-farm": [{ name: "Amit", phone: "+44 7941 651392" }],
  clerkenwell: [
    { name: "Carol", phone: "+1 (602) 908-0540" },
    { name: "Louis", phone: "+1 (602) 908-1680" },
    { name: "Kira", phone: "+1 (602) 908-7056" },
  ],
  "exchange-gardens": [
    { name: "Sajal", phone: "+1 (650) 864-3423" },
    { name: "Mehak", phone: "+1 (650) 743-1405" },
  ],
  farringdon: [
    { name: "Julie", phone: "+1 (703) 470-8441" },
    { name: "Paul", phone: "+1 (703) 470-8442" },
  ],
  fulham: [{ name: "Gela", phone: "+34 609 09 90 94" }],
  hampstead: [{ name: "Host", phone: "+44 7980 447962" }],
  marylebone: [
    { name: "Marianne", phone: "+44 7841 815949" },
    { name: "David", phone: "+44 7775 858270" },
  ],
  mayfair: [
    { name: "Julie", phone: "+44 7939 273429" },
    { name: "Gegg", phone: "+44 7790 808079" },
  ],
  neckinger: [{ name: "Peter", phone: "+44 7973 750561" }],
  "notting-hill": [
    { name: "Lisa", phone: "+852 9859 1500" },
    { name: "Nick", phone: "+852 5186 6873" },
  ],
  "paddington-11": [
    { name: "Rory", phone: "+44 7917 030115" },
    { name: "Nancy", phone: "+44 7917 030112" },
    { name: "Office Renaissance", phone: "+44 7477 906899" },
  ],
  "paddington-12": [
    { name: "Rory", phone: "+44 7917 030115" },
    { name: "Nancy", phone: "+44 7917 030112" },
    { name: "Office Renaissance", phone: "+44 7477 906899" },
  ],
  pembridge: [
    { name: "Uttam", phone: "+44 7854 615609" },
    { name: "Clare", phone: "+44 7968 718521" },
  ],
  "royal-oak": [{ name: "Peyman", phone: "+44 7770 777477" }],
  "third-avenue": [{ name: "Jacqueline", phone: "+27 66 365 9942" }],
  "union-street": [
    { name: "Dario", phone: "+44 7403 534328" },
    { name: "Tiz", phone: "+39 371 527 4384" },
  ],
  vauxhall: [{ name: "Dainius", phone: "+44 7474 118218" }],
  "shepherds-bush": [
    { name: "Alejo", phone: "+44 7818 614010" },
    { name: "Isabel", phone: "+44 7780 684883" },
  ],
};

export function getGlobalContact(id: EscalationContactId | string): GlobalContact | undefined {
  return GLOBAL_CONTACTS.find((c) => c.id === id);
}

export function getPropertyHosts(propertyId: string): HostContact[] {
  return PROPERTY_HOSTS[propertyId] ?? [];
}
