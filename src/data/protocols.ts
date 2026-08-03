import type {
  EscalationContactId,
  Issue,
  Priority,
  ProtocolStep,
} from "@/shared/types";

type PriorityCategory =
  | "Urgent - Safety / No Habitability"
  | "Service Impacting (Medium-High)"
  | "Inconvenient but Not Critical"
  | "Admin / Informational";

type Config = {
  id: string;
  name: string;
  category: string;
  raw: string;
  priorityCategory?: PriorityCategory;
  reservationVerification?: Issue["reservationVerification"];
  contact?: string;
  escalationDetails?: string;
  guide?: boolean;
};

const NEXT_DAY = "Stay in London - Next Day Follow up";
const CLEANING = "Cleaning Emergency Contact";
const PROPERTY = "Escalation Contact Depends on Property";

const NEXT_DAY_DETAILS =
  "Tag Dainius and Casey on Slack for their review the following day";
const CLEANING_DETAILS =
  "447481338302 or +447481338302 from 6pm-8pm Opago Cleaning Services";
const PROPERTY_DETAILS = "Go to Emergency Contacts Tab";

const priorityFromCategory = (category: PriorityCategory): Priority => {
  switch (category) {
    case "Urgent - Safety / No Habitability":
      return "P1";
    case "Service Impacting (Medium-High)":
      return "P2";
    case "Inconvenient but Not Critical":
      return "P3";
    case "Admin / Informational":
      return "P4";
  }
};

const escalationContactIdFromName = (name: string): EscalationContactId =>
  name === CLEANING ? "cleaning" : name === PROPERTY ? "property" : "next-day";

export type TroubleshootingSection = {
  title: string;
  body: string;
};

/** Split SIL troubleshooting on ---- / --- rules, then double newlines if needed. */
export const splitTroubleshootingSections = (
  raw: string,
): TroubleshootingSection[] => {
  let parts = raw
    .trim()
    .split(/\n\s*(?:-{2,}|–+|—+)\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    const byPara = parts[0]
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (byPara.length > 1) parts = byPara;
  }

  return parts.map((chunk) => {
    const lines = chunk.split("\n");
    const firstLine = lines[0]?.trim() ?? "";
    const end = firstLine.search(/[.!?](?:\s|$)/);
    const title = (end < 0 ? firstLine : firstLine.slice(0, end + 1)).trim();
    const restOfFirst = end < 0 ? "" : firstLine.slice(end + 1).trim();
    const body = [restOfFirst, ...lines.slice(1)].join("\n").trim();
    return { title: title || "Step", body };
  });
};

export const stepsFromTroubleshooting = (
  raw: string,
  prefix: string,
): ProtocolStep[] =>
  splitTroubleshootingSections(raw).map((section, index) => ({
    id: `${prefix}-s${index + 1}`,
    label: section.title,
    ...(section.body.length > 8 ? { hint: section.body } : {}),
  }));

const verificationFor = (
  value: Issue["reservationVerification"],
): string[] => {
  if (value === "Not Required") return [];
  if (value === "Required on Escalated") {
    return [
      "Confirm reservation if escalating",
      "Confirm guest cannot wait until morning",
    ];
  }
  return [
    "Confirm reservation is active",
    "Verify caller ID matches booking",
    "Confirm guest is at/near the property",
  ];
};

const makeIssue = ({
  priorityCategory = "Inconvenient but Not Critical",
  reservationVerification = "Required",
  contact = NEXT_DAY,
  escalationDetails = NEXT_DAY_DETAILS,
  guide = false,
  ...config
}: Config): Issue => {
  const priority = priorityFromCategory(priorityCategory);
  const steps = stepsFromTroubleshooting(config.raw, config.id);
  return {
    id: config.id,
    name: config.name,
    category: config.category,
    troubleshootingRaw: config.raw,
    steps,
    reservationVerification,
    verification: verificationFor(reservationVerification),
    escalationContactId: escalationContactIdFromName(contact),
    escalationDetails,
    escalation: `${contact}: ${escalationDetails}`,
    priorityCategory,
    priority,
    documents: guide ? [{ title: "Property Guide", type: "Link" }] : [],
    aiRecommendation:
      steps[0]?.label ?? "Collect booking details before proceeding.",
  };
};

export const ISSUES: Issue[] = [
  makeIssue({
    id: "i-lost-keys",
    name: "Door – Lost Keys (Spare key with KeyNest)",
    category: "Access",
    priorityCategory: "Urgent - Safety / No Habitability",
    guide: true,
    raw: `Once reservation has been confirmed and caller id verfication matches.
Log in to the KeyNest main account.
Locate the key using the key title listed in property info doc and confirm the spare key is in store and available for collection.
Generate a spare key collection code.
Label the collection as “GuestCare – [Guest Name]”.
Share the collection code and pickup instructions with the guest.
Advise the guest to call GuestCare back if they experience any issues collecting the key at the Point.
-----------
Ask the guest to collect the spare key and attempt entry.
Call back or stay on the line to confirm the guest has entered the property successfully.
------------
If the guest reports an issue at the Point, contact the Point staff and act as KeyNest customer support, performing key audits and all necessary checks.

If the audit confirms no spare key is available, contact the approved emergency contact to arrange an alternative access solution.

-----
If spare key not available on KN, provide additional lockbox emergency key information to guest 

----
Once access is restored, report the issue as resolved.`,
  }),
  makeIssue({
    id: "i-smart-lock",
    name: "Door – Smart Lock Not Working",
    category: "Access",
    priorityCategory: "Urgent - Safety / No Habitability",
    guide: true,
    raw: `Once reservation has been confirmed and caller id verfication matches.
Confirm the smart lock issue (code not working, lock unresponsive, app not opening, keypad locked).
Ask the guest to re-enter the access code slowly and carefully.
Ask the guest to check for lockout messages or low-battery indicators on the device.
Attempt remote unlock, reset, or code refresh if system access is available.
If access is not restored, check for a backup access method (physical key, KeyNest spare, lockbox).
If a backup access method is available, provide instructions and confirm entry.
If no backup access is available, contact the approved emergency contact.
Once access is restored, report the issue as resolved.`,
  }),
  makeIssue({
    id: "i-cant-find-lockbox",
    name: "Door – Can't Find Lockbox",
    category: "Access",
    priorityCategory: "Urgent - Safety / No Habitability",
    guide: true,
    raw: `Once reservation has been confirmed and caller id verfication matches.
Confirm the lockbox location listed in the check-in instructions.
Ask the guest to re-check the exact location, including nearby railings, doors, meters, or gates.
Ask the guest to send a photo of the area if possible.
Check whether an alternative access method exists.
If alternative access is available, provide instructions and confirm entry.
If no alternative access is available, contact the approved emergency contact.
Once access is restored, report the issue as resolved.`,
  }),
  makeIssue({
    id: "i-lockbox-code",
    name: "Door – Lockbox Code Not Working",
    category: "Access",
    priorityCategory: "Urgent - Safety / No Habitability",
    guide: true,
    raw: `Once reservation has been confirmed and caller id verification matches.
Ask the guest to re-enter the lockbox code slowly and ensure the lockbox is fully closed before retrying.
Ask the guest to gently pull or tap the lockbox while entering the code.
Verify the lockbox code in the system and resend it if necessary.
Ask the guest to retry opening the lockbox.
If the lockbox still does not open, check for an alternative access method.
If no alternative access is available, contact the approved emergency contact.
Once access is restored, report the issue as resolved.`,
  }),
  makeIssue({
    id: "i-locked-inside",
    name: "Door – Guest Locked Inside Apartment",
    category: "Access",
    priorityCategory: "Urgent - Safety / No Habitability",
    contact: PROPERTY,
    escalationDetails: PROPERTY_DETAILS,
    guide: true,
    raw: `Once reservation has been confirmed and caller id verification matches.
Confirm the guest cannot exit the apartment.
Ask the guest to try unlocking the door using the handle and key/code carefully.
Check whether a secondary exit is available and safe to use.
If the guest cannot exit and feels unsafe, contact the approved emergency contact immediately.
Stay in contact until the situation is resolved.
Report the issue as resolved once safe access is restored.`,
  }),
  makeIssue({
    id: "i-unable-checkin",
    name: "Unable to Check In",
    category: "Access",
    priorityCategory: "Urgent - Safety / No Habitability",
    contact: PROPERTY,
    escalationDetails: PROPERTY_DETAILS,
    guide: true,
    raw: `Once reservation has been confirmed and caller id verfication matches.

If unable to check in due to main key not being available, provide guest with emergency keys from KN. Generate a collection code for spare set and add the guest name in collection page as "GuestCare - [Guest's Name]" and share with guest.

If no emergency KN key, provide additional lockbox emergency key information to guest
-----

If unable to check in due to the lock not working, provide guest with emergency keys. And ask them to try that set.

If emergency key does not work, contact maintenance escalation contact Call Host 

If host not picking up or unable to resolve - call guests and ask them to seek alternative accommodation through the same booking site for the night.

---
Report issue.`,
  }),
  makeIssue({
    id: "i-security-deposit-info",
    name: "Information About Security Deposit",
    category: "Admin / Finance",
    priorityCategory: "Admin / Informational",
    raw: `Once reservation has been confirmed and caller ID verification matches.
Ask the guest what information they are requesting regarding the security deposit.
Explain that you have logged the query and someone from the team will be in touch the next day.
Clarify that you are part of the out-of-hours emergency support team and cannot confirm amounts or outcomes.
Report issue.`,
  }),
  makeIssue({
    id: "i-security-deposit-claim",
    name: "Claim Regarding Security Deposit",
    category: "Admin / Finance",
    priorityCategory: "Admin / Informational",
    raw: `Once reservation has been confirmed and caller ID verification matches.
Ask the guest to explain the reason for their claim.
Explain that the claim has been noted and will be reviewed by the team that follows up the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-claim-forms",
    name: "Claim Forms",
    category: "Admin / Finance",
    priorityCategory: "Admin / Informational",
    raw: `Once reservation has been confirmed and caller ID verification matches.
Confirm reservation details and the reason the claim form is needed.
Explain it will be passed to the relevant team and that someone from the team will be in touch the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-owners-call",
    name: "Owners Call",
    category: "Admin / Owners",
    priorityCategory: "Admin / Informational",
    reservationVerification: "Not Required",
    raw: `Take down callers full name. (Make sure to get correct spelling)
Reason for calling.
Explain that we are an emergency guest support line and that you will pass this on to the team, who will call them the next day.
Report issue`,
  }),
  makeIssue({
    id: "i-future-reservation",
    name: "Future Guest Wants to Make a Reservation",
    category: "Admin / Sales",
    priorityCategory: "Admin / Informational",
    reservationVerification: "Not Required",
    raw: `Confirm the caller is not currently staying at a property.
Inform them to book through the website: stayinlondon.co.uk or email: reservations@stayinlondon.co.uk 
Report call.`,
  }),
  makeIssue({
    id: "i-extension",
    name: "Extension request",
    category: "Admin / Sales",
    priorityCategory: "Admin / Informational",
    raw: `All extension requests can only be reviewed with at least 24 hour notice, so if there's less time left until checkout, inform the guest that extension is not possible.	

If more than 24hours until checkout, inform guests that their request will be dealt with during office hours 9AM to 6PM.

Report Call`,
  }),
  makeIssue({
    id: "i-dishwasher",
    name: "Dishwasher / Dryer / Washing Machine",
    category: "Appliances",
    reservationVerification: "Not Required",
    raw: `Ask the guest to confirm the appliance is plugged in.
Ask the guest to check circuit breakers and restart the appliance.
Ask whether the appliance is urgently needed (for example for baby items or long stays).
Explain the issue has been reported and someone from the team will be in touch the next day.
If the guest cannot wait and the appliance is essential, escalate for review.
If compensation is requested, explain this has been added as a note for the team to review.
Report issue.`,
  }),
  makeIssue({
    id: "i-microwave",
    name: "Microwave / Coffee Machine",
    category: "Appliances",
    reservationVerification: "Not Required",
    raw: `Ask the guest to confirm the appliance is plugged in.
Ask the guest to check circuit breakers.
Explain the issue has been reported and someone from the team will be in touch the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-tv",
    name: "TV Not Working",
    category: "Appliances",
    reservationVerification: "Not Required",
    raw: `Ask the guest to check the remote control batteries.
Ask the guest to turn on the TV using the power button on the TV itself.
Confirm the TV is plugged in and ask the guest to check circuit breakers.
Explain the issue has been reported and will be reviewed the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-iron",
    name: "Iron",
    category: "Appliances",
    reservationVerification: "Not Required",
    raw: `Ask the guest to confirm the iron is plugged in and switched on.
Ask the guest to try a different power outlet.
Explain the issue has been reported and someone from the team will be in touch the next day.
If compensation is requested, explain this has been noted for review by the follow-up team.
Report issue.`,
  }),
  makeIssue({
    id: "i-hob",
    name: "Ceramic Hob Not Working – No Alternative",
    category: "Appliances (Essential)",
    reservationVerification: "Not Required",
    raw: `Ask the guest to hold the power button for several seconds.
Confirm the lock (padlock) icon is not enabled.
Ask the guest to check circuit breakers.
If the hob is induction, confirm compatible cookware is being used.
If the hob still does not work, ask if them to please manage without cooking until morning.
Suggest alternatives such as using a microwave if available, kettle/hot water for simple meals, or ordering takeaway for the night.
Let the guest know the issue has been reported and someone from the team will be in touch the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-fridge",
    name: "Refrigerator Not Working",
    category: "Appliances (Essential)",
    reservationVerification: "Not Required",
    raw: `Ask the guest to confirm the refrigerator is plugged in securely.
Ask the guest to check temperature settings and circuit breakers.
Ask whether the internal light turns on when the door is opened.
If the light is on, advise allowing time for cooling.
If the refrigerator is still not cooling, ask them to please manage food storage until morning.
Suggest keeping the fridge door closed, storing perishables in sealed bags, and using a cooler bag/ice if available, and avoiding leaving perishables at room temperature.
Let the guest know the issue has been reported and someone from the team will be in touch the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-elevator-stuck",
    name: "Elevator Not Working – Guest Stuck Inside",
    category: "Building Infrastructure",
    priorityCategory: "Urgent - Safety / No Habitability",
    contact: PROPERTY,
    escalationDetails: PROPERTY_DETAILS,
    raw: `Confirm whether the guest is currently trapped inside the elevator.
If the guest is trapped, instruct them to use the emergency button or phone inside the elevator.
Call the elevator emergency number immediately if available.
Notify the property emergency contact right away.
Stay on the phone with the guest to reassure them until help arrives.
Explain next steps and confirm follow-up.
Report issue.`,
  }),
  makeIssue({
    id: "i-elevator-complaint",
    name: "Elevator Not Working – Complaint About Getting Up/Down",
    category: "Building Infrastructure",
    reservationVerification: "Not Required",
    raw: `Confirm the guest is not trapped inside the elevator.
Explain the issue has been reported and someone from the team will be in touch the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-elevator-access",
    name: "Elevator Not Working – Guest Has Accessibility Needs",
    category: "Building Infrastructure",
    priorityCategory: "Urgent - Safety / No Habitability",
    reservationVerification: "Required on Escalated",
    raw: `Confirm the guest’s accessibility needs (mobility issues, wheelchair use, medical reasons).
Confirm whether the guest is still able to safely access the apartment, even if it takes longer or requires additional effort.
If the guest is able to access the property but with difficulty, apologise for the inconvenience and explain that the issue has been reported so the team is aware and can follow up.
If the guest is unable to access the property, arrange relocation to an alternative accessible property where available.
If relocation is not immediately available, advise the guest they may book a hotel with a nightly rate of up to £X, keep the receipt, and email it to xxx@email.com
Explain next steps and confirm that the team will follow up with the guest the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-ac-extreme",
    name: "Air Conditioning Not Working – Extreme Weather",
    category: "Climate & Comfort",
    priorityCategory: "Service Impacting (Medium-High)",
    reservationVerification: "Required on Escalated",
    raw: `Ask the guest to confirm the air conditioning is switched on and set to cooling.
Ask the guest to lower the temperature by at least 3–5 degrees to trigger the system.
Ask the guest to check circuit breakers and reset if needed.
Ask the guest to check or replace the remote control batteries.
If the air conditioning is still not working, ask if they can manage until morning.
If they can manage, suggest alternatives such as opening windows if safe, using fans if available, closing blinds/curtains, staying in the coolest room, and avoiding heat-generating appliances.
Let the guest know the issue has been reported and someone from the team will be in touch the next day.
Only contact the escalation contact if the guest clearly cannot wait due to the conditions.
If compensation is requested, explain it has been noted and will be reviewed by the team that follows up.
Report issue.`,
  }),
  makeIssue({
    id: "i-ac-mild",
    name: "Air Conditioning Not Working – Mild Weather",
    category: "Climate & Comfort",
    reservationVerification: "Required on Escalated",
    raw: `Ask the guest to confirm the air conditioning is switched on and set correctly.
Ask the guest to adjust the temperature and check circuit breakers.
Ask the guest to restart the unit if possible.
If the air conditioning is still not working, ask if they are comfortable waiting until morning.
If needed, suggest alternatives such as opening windows if safe, using fans if available, and closing blinds/curtains during the day.
Let the guest know the issue has been reported and someone from the team will be in touch the next day.
Only contact the escalation contact if the guest clearly cannot wait.
If compensation is requested, explain it has been noted for review by the follow-up team.
Report issue.`,
  }),
  makeIssue({
    id: "i-heating-extreme",
    name: "Heating Not Working – Extreme Weather (Autumn / Winter)",
    category: "Climate & Comfort",
    priorityCategory: "Service Impacting (Medium-High)",
    reservationVerification: "Required on Escalated",
    raw: `Confirm they have located the thermostat and they have set the temperature.
If yes but not working, tell them to check the boiler control panel. Make sure the boiler is on and that the control panel is on the right setting.
If no, give instructions where the thermostat is and how to use it
If the heating is still not working, ask the guest to check the boiler control panel:
If it is not working, ask them to check the fuse board switches are up.
–
If the heating is still not working, suggest short-term comfort measures such as:
Using extra blankets or bedding
Closing windows and doors
Wearing warmer layers
Staying in the warmest room
–-
Let the guest know the issue has been reported and will be reviewed by the team tomorrow at 9:00am.
If the guest asks about refunds or compensation, explain that this has been noted and will be reviewed by the team during follow-up.
Report issue.`,
  }),
  makeIssue({
    id: "i-heating-mild",
    name: "Heating Not Working – Mild Weather (Spring / Summer)",
    category: "Climate & Comfort",
    reservationVerification: "Not Required",
    raw: `Confirm they have located the thermostat and they have set the temperature.
If yes but not working, tell them to check the boiler control panel. Make sure the boiler is on and that the control panel is on the right setting.
If no, give instructions where the thermostat is and how to use it
If the heating is still not working, ask the guest to check the boiler control panel:
If it is not working, ask them to check the fuse board switches are up.
–
If the heating is still not working, suggest short-term comfort measures such as:
Using extra blankets or bedding
Closing windows and doors
Wearing warmer layers
Staying in the warmest room
–-
Let the guest know the issue has been reported and will be reviewed by the team tomorrow at 9:00am.
If the guest asks about refunds or compensation, explain that this has been noted and will be reviewed by the team during follow-up.
Report issue.`,
  }),
  makeIssue({
    id: "i-wifi",
    name: "WiFi Not Working",
    category: "Connectivity",
    reservationVerification: "Not Required",
    raw: `Ask the guest to confirm they are connecting to the correct WiFi network.
Provide the correct network name and password if required.
Ask the guest to restart the router and wait 2–3 minutes.
Ask the guest to reconnect and test again.
Suggest moving closer to the router and disconnecting/reconnecting devices.
If WiFi is still not working, ask if they can use mobile data or hotspot temporarily.
Let the guest know the issue has been reported and someone from the team will be in touch the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-dirty-apt",
    name: "Dirty Apartment / Floor",
    category: "Housekeeping",
    reservationVerification: "Required on Escalated",
    contact: CLEANING,
    escalationDetails: CLEANING_DETAILS,
    raw: `Ask the guest to explain which areas of the apartment are unclean.
Confirm whether the issue affects sleeping areas or the bathroom.
If sleeping areas (bed, bedroom, sofa bed) are unclean, escalate immediately to emergency cleaning.
If the bathroom is unclean, ask whether the guest can manage temporarily or needs it addressed immediately.
If only non-essential areas (e.g. kitchen, hallway) are affected and the guest can manage, explain that the issue has been reported and will be reviewed the next day.
If the guest cannot manage, escalate to emergency cleaning.
If the apartment has already been cleaned but issues remain, note exactly what has not been cleaned and record the guest’s concerns in detail.

To arrange emergency cleaning or missing items, call Opago on +44 (0)203 865 0599:
State the company name STAY IN LONDON
State the property name
Explain what is missing or what requires cleaning
Arrange for the items or cleaning to be done at the property
Report the issue.`,
  }),
  makeIssue({
    id: "i-missing-sheets",
    name: "Laundry – Missing Sheets / Towels",
    category: "Housekeeping",
    reservationVerification: "Required on Escalated",
    contact: CLEANING,
    escalationDetails: CLEANING_DETAILS,
    raw: `Check if extra sheets/towels are available in the properties closets.	

—-

If there is no sheets for guests to sleep in, call the emergency cleaning number.

 Call Opago  +44 (0)203 865 0599, state the company name STAY IN LONDON and state the property name. Explain what is missing and arrange for them to order the items to the property	
Report Issue.`,
  }),
  makeIssue({
    id: "i-sofa-bedding",
    name: "Can't Find Bedding for Sofa Bed",
    category: "Housekeeping",
    reservationVerification: "Required on Escalated",
    contact: CLEANING,
    escalationDetails: CLEANING_DETAILS,
    raw: `Ask the guest to check under the sofa and inside bedroom closets.
Confirm whether the sofa bed is needed for sleeping that night.
Confirm whether the sofa bed bedding was prearranged or requested in advance.
If the sofa bed bedding was prearranged and the guest cannot wait until the next day, escalate immediately and call Opago  +44 (0)203 865 0599, state the company name STAY IN LONDON and state the property name. Explain what is missing and arrange for them to order the items to the property
If the sofa bed bedding was prearranged but the guest is able to wait until the next day, do not escalate and explain the issue has been reported for next-day follow-up.
If the sofa bed bedding was not prearranged, explain that the request has been escalated for review and that someone from the team will be in touch the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-something-missing",
    name: "Something Missing in Apartment",
    category: "Housekeeping",
    reservationVerification: "Required on Escalated",
    raw: `Clarify exactly what item is missing and how the guest knows it should be in the apartment (for example, shown in listing photos, mentioned in the description, or expected as a standard item such as a microwave or hairdryer).
Confirm whether the missing item is essential and whether its absence prevents the guest from being able to stay comfortably in the apartment.
Only escalate to the emergency contact if the missing item is essential and the guest cannot reasonably stay without it.
If the item is not essential, explain that the issue has been reported and that someone from the team will be in touch tomorrow to follow up.
Report issue.`,
  }),
  makeIssue({
    id: "i-burglary-active",
    name: "Burglary in Apartment – Active / Recent",
    category: "Safety & Security",
    priorityCategory: "Urgent - Safety / No Habitability",
    contact: PROPERTY,
    escalationDetails: PROPERTY_DETAILS,
    raw: `Confirm the guest is safe and not inside the apartment.
Provide the local police phone number and instruct the guest to file a police report.
Notify the emergency contact immediately.
Advise the guest not to touch anything until the police attend.
You can stay on the phone with the caller to make sure they feel safe and are not alone.
Once the police report has been completed, check whether the guest feels comfortable staying in the apartment.
If the guest does not feel comfortable staying, arrange relocation to an available alternative property, or advise the guest they may book a hotel up to £X per night, keep the receipt, and email it to xxx@email.com
.
Explain to the caller what actions have been taken, what will happen next, and that they will hear from the team the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-burglary-safe",
    name: "Burglary in Apartment – No Immediate Threat",
    category: "Safety & Security",
    priorityCategory: "Service Impacting (Medium-High)",
    contact: PROPERTY,
    escalationDetails: PROPERTY_DETAILS,
    raw: `Confirm the guest is safe.
Provide the local police phone number and instruct the guest to file a police report.
Notify the emergency contact.
Check whether the guest feels comfortable staying in the apartment.
If the guest does not feel comfortable staying, arrange relocation to an available alternative property, or advise the guest they may book a hotel up to £X per night, keep the receipt, and email it to xxx@email.com
Explain to the caller that the issue has been reported and will be reviewed by the team the next day.
Report issue.`,
  }),
  makeIssue({
    id: "i-security-alarm",
    name: "Security Alarm Goes Off",
    category: "Safety & Security",
    priorityCategory: "Urgent - Safety / No Habitability",
    contact: PROPERTY,
    escalationDetails: PROPERTY_DETAILS,
    raw: `Once reservation has been confirmed and caller ID verification matches.
Ask the guest which alarm system is installed and where the control panel or keypad is located.
Ask the guest to enter the alarm code slowly and confirm the correct button is pressed (disarm/off).
Ask the guest to check if any doors or windows are open and close them before retrying.
Ask the guest to wait 30 seconds and retry the code if the system is temporarily locked.
If the alarm is still sounding after these checks, notify the emergency contact immediately.
Stay on the phone with the guest until the alarm is silenced or assistance arrives.
Once alarm is silenced, report issue`,
  }),
  makeIssue({
    id: "i-fire",
    name: "Fire in the Apartment",
    category: "Safety & Security",
    priorityCategory: "Urgent - Safety / No Habitability",
    reservationVerification: "Not Required",
    contact: PROPERTY,
    escalationDetails: PROPERTY_DETAILS,
    raw: `If there is a fire in the building: give the guest the phone number for the fire brigade (999). Notify the emergency contact as well.  Call Host`,
  }),
  makeIssue({
    id: "i-power-full",
    name: "Electricity – No Power in Property (Full Outage)",
    category: "Utilities – Electrical",
    priorityCategory: "Urgent - Safety / No Habitability",
    raw: `Ask if any lights or sockets are working.
Instruct the guest to check the circuit breaker panel.
If breakers are OFF, ask the guest to switch them ON.
If the breaker trips again, ask the guest which zone/area is affected (e.g., kitchen, bathroom). Note the issue.Inform the guest that it will be reviewed the next day.`,
  }),
  makeIssue({
    id: "i-power-partial",
    name: "Electricity – Partial Power Loss",
    category: "Utilities – Electrical",
    priorityCategory: "Service Impacting (Medium-High)",
    reservationVerification: "Not Required",
    raw: `Ask which rooms or appliances are affected.
Ask the guest to check breakers related to the affected area.
Instruct the guest to unplug devices and reset the breaker.
If unresolved, report as PM follow-up required.`,
  }),
  makeIssue({
    id: "i-power-building",
    name: "Electricity – No Power in Building",
    category: "Utilities – Electrical",
    priorityCategory: "Urgent - Safety / No Habitability",
    raw: `Ask the guest to check for lights in common areas (hallway, staircase, lobby).
Confirm the issue is building-wide if no lights are present.
Inform the guest the issue has been reported and is being handled.
Note the issue.Inform the guest that it will be reviewed the next day.`,
  }),
  makeIssue({
    id: "i-leak-active",
    name: "Water Leak – Cannot Stop (Active Leak)",
    category: "Utilities – Plumbing",
    priorityCategory: "Urgent - Safety / No Habitability",
    contact: PROPERTY,
    escalationDetails: PROPERTY_DETAILS,
    raw: `Ask the guest if water is actively leaking right now.
Instruct the guest to immediately close the nearest water shut-off valve.
Confirm whether the leak has stopped.
If the leak continues or the valve cannot be closed, contact emergency maintenance immediately.
Keep the guest updated until attendance is confirmed.`,
  }),
  makeIssue({
    id: "i-leak-shutoff",
    name: "Water Leak – Can Shut Off Valve",
    category: "Utilities – Plumbing",
    priorityCategory: "Service Impacting (Medium-High)",
    reservationVerification: "Not Required",
    raw: `Instruct the guest to close the water shut-off valve.
Confirm the leak has fully stopped.
Ask where the leak originated (sink, toilet, appliance, etc.).
Inform the guest the issue will be inspected the next day.
Report as PM follow-up required.`,
  }),
  makeIssue({
    id: "i-no-water",
    name: "No Water – Entire Apartment",
    category: "Utilities – Plumbing",
    priorityCategory: "Urgent - Safety / No Habitability",
    reservationVerification: "Not Required",
    contact: PROPERTY,
    escalationDetails: PROPERTY_DETAILS,
    raw: `Confirm with the guest that no taps are working.
Ask the guest to check that the main water valve is open.
Ask if neighbouring apartments or the building are also affected.
If unresolved, contact emergency maintenance immediately.
Keep the guest informed of progress.`,
  }),
  makeIssue({
    id: "i-no-water-partial",
    name: "No Water – Partial (Hot or Cold Only)",
    category: "Utilities – Plumbing",
    priorityCategory: "Service Impacting (Medium-High)",
    reservationVerification: "Not Required",
    raw: `Confirm whether hot water or cold water is affected.
Ask if the issue occurs at all taps.
If hot water only, follow hot water troubleshooting steps.
If unresolved, report as PM follow-up required.`,
  }),
  makeIssue({
    id: "i-no-hot-water",
    name: "No Hot Water (Boiler / Heater Down)",
    category: "Utilities – Plumbing",
    priorityCategory: "Urgent - Safety / No Habitability",
    reservationVerification: "Required on Escalated",
    raw: `Confirm the boiler/heater is plugged in and the wall switches are on. Check the fuse board switches are up.

For water heaters: Ask if a shower has been taken recently. If yes, the tank may be empty. Additionally, ask the guests to find the control panel and press the boost/advance boost button. Wait at least an hour.

For boilers: Check that water pressure is adequate.


If still no hot water, escalate if the guest cannot wait; otherwise report PM follow-up.`,
  }),
  makeIssue({
    id: "i-intermittent-hot-water",
    name: "Reduced / Intermittent Hot Water",
    category: "Utilities – Plumbing",
    priorityCategory: "Service Impacting (Medium-High)",
    reservationVerification: "Not Required",
    raw: `Ask how long the hot water lasts before turning cold.
Confirm no recent heavy water usage.
Ask the guest to wait 45 minutes and retry.
If the issue continues, report as PM follow-up required.`,
  }),
];
