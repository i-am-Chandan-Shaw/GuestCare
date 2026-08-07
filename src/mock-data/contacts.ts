import type { EscalationContactId, GlobalContact } from "@/shared/types";

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
    details: "Go to Emergency Contacts for the selected customer",
  },
];

export function getGlobalContact(id: EscalationContactId | string): GlobalContact | undefined {
  return GLOBAL_CONTACTS.find((c) => c.id === id);
}
