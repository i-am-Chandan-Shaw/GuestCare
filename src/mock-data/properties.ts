import type { Property, SystemInfo, SystemKey } from "@/shared/types";
import { isPresent, parseEscalation } from "@/shared/types";
import { getPropertyHosts } from "./contacts";
import { getPropertyImageUrl } from "@/mock-data/property-images";

const MEDIA_FOLDER_URL = "https://drive.google.com/drive/folders/16lz6Pfy4n8CRWC6RTy_fwJkObwvazLLr";

type SystemSource = Partial<Record<SystemKey, { info?: string; escalation?: string }>>;

function buildSystems(source: SystemSource): Partial<Record<SystemKey, SystemInfo>> {
  return Object.fromEntries(
    Object.entries(source).flatMap(([key, value]) => {
      const infoRaw = value?.info;
      const info = isPresent(infoRaw) ? infoRaw.trim() : undefined;
      const escalation = parseEscalation(value?.escalation);

      return info || escalation
        ? [[key as SystemKey, { ...(info ? { info } : {}), ...(escalation ? { escalation } : {}) }]]
        : [];
    }),
  ) as Partial<Record<SystemKey, SystemInfo>>;
}

type PropertySource = Omit<Property, "hosts" | "systems" | "tags"> & {
  systems?: SystemSource;
};

function property(source: PropertySource): Property {
  return {
    ...source,
    systems: buildSystems(source.systems ?? {}),
    hosts: getPropertyHosts(source.id),
    tags: [source.type, source.floor].filter(isPresent),
  };
}

const standardCheckOut =
  "Turn off lights, close windows, turn down heating, lock the property. Return keys to KeyNest/lockbox by 10:00.";

const DEFAULT_HOUSE_RULES = [
  "No shoes inside",
  "No smoking or vaping indoors",
  "No pets",
  "No additional guests",
  "Quiet hours: 11PM to 8AM",
];

function propertyWithDefaults(source: PropertySource): Property {
  const p = property({
    ...source,
    imageUrl: source.imageUrl ?? getPropertyImageUrl(source.id),
  });
  if (!p.houseRules.length) p.houseRules = [...DEFAULT_HOUSE_RULES];
  return p;
}

export const PROPERTIES: Property[] = [
  propertyWithDefaults({
    id: "almorah",
    name: "Almorah",
    type: "Apartment",
    maxGuests: 5,
    buildingNumber: "2",
    unit: "Cottage 3",
    address: "Cottage 3, 2 Almorah Road, N1 3EU",
    floor: "Ground",
    guideUrl:
      "https://docs.google.com/document/d/1WEzpZyoBWQ7KSK2-YMfAwjYPS8UEIo3trUErRE5K6v0/edit?tab=t.0",
    listingUrl: "https://www.airbnb.co.uk/rooms/1497137911142581794",
    specificInfo:
      "Keys: Main guest key in KeyNest. Spare keys on kitchen table. Additional keys in cabinet by entrance. Emergency key in lockbox.\n\nLayout: Ground floor — master bedroom with ensuite, shared bathroom, study, small balcony. Lower level — kitchen, lounge, garden, bunk bedroom.\n\nGuest key from KeyNest; unlock top and bottom locks with larger keys and middle lock with smaller key.",
    checkIn: {
      time: "16:00",
      instructions:
        "Pick up keys from KeyNest, then go to Cottage 3 (grey door). Unlock top and bottom locks with the two larger keys; middle lock with the smaller key. Lock top and bottom behind you.",
    },
    checkOut: {
      time: "10:00",
      instructions:
        "Turn off lights, close windows, turn down heating, lock front/back/balcony. Return keys to the same KeyNest store by 10am (no code needed).",
    },
    spareKeys:
      "Emergency lockbox at western end of Downham Rd on blue fence by green bike shed at Rotherfield Ct — code DEMO-CODE. Spare set on kitchen table must stay in the property.",
    wifi: {
      network: "Hyperoptic Fibre 0693",
      password: "DEMO-WIFI-PASS",
      location: "Cupboard by the front door",
      raw: "Located in the cupboard by the front door — Hyperoptic Fibre 0693 / DEMO-WIFI-PASS",
    },
    houseRules: [...DEFAULT_HOUSE_RULES],
    laundry: "Washer dryer combo in the kitchen. Complimentary white capsules.",
    laundryEscalation: "host",
    waste:
      "Rubbish can be left for cleaners. Large bins at end of Downham Road by the housing block if needed before checkout.",
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: {
      keyNest: "KeyNest store — main guest key",
      accessNotes: "Cottage 3 grey door; dual locks + middle lock",
    },
    systems: {
      heating: {
        info: "Thermostat on wall next to shared bathroom. Boiler in cupboard next to thermostat. Timer: 6–9am, 12–2pm, 6–9pm. Manual override via small white switch on right.",
        escalation: "Call Host",
      },
      alarms: {
        info: "Carbon monoxide alarm by boiler; smoke alarms throughout",
        escalation: "Call emergency services then host",
      },
      breakIn: { escalation: "Call emergency services then host" },
      locksmith: { escalation: "Call Host" },
      drains: {
        info: "Do not touch water pump in kitchen corner cupboard — must stay on for lower-level drainage.",
        escalation: "Call Host",
      },
      electrical: {
        info: "Fuse box in mirrored cupboard by entrance. Flick downed switches up to restore power.",
        escalation: "Call Host",
      },
      gas: {
        info: "Meter and shut off in mirrored cupboard by front door",
      },
      leak: { escalation: "Call Host" },
      waterSupply: { escalation: "Call Host" },
    },
  }),
  propertyWithDefaults({
    id: "battersea",
    name: "Battersea Park",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "372",
    unit: "94",
    address: "94 Oswald Building, 372 Queenstown Road, London, SW11 8PG",
    floor: "9th",
    guideUrl:
      "https://docs.google.com/document/d/1go0sxvB-TJq1ZPUjDDoZXD1sykR_PAGUHFK6sZgY7kQ/edit?tab=t.0",
    listingUrl: "https://www.airbnb.co.uk/rooms/1371472371454426617",
    specificInfo:
      "Keys: Guest key at KeyNest; 2nd key at concierge; 3rd key in lockbox/emergency set. Layout: 2× double bedrooms with ensuite, open-plan living/kitchen/dining, 2 balconies, utilities cupboard by entrance.",
    checkIn: {
      time: "16:00",
      instructions:
        "Enter Oswald Building (labelled 374 Oswald Building Apartments 1–142) next to water features. Fob through gate, then ‘Apartments 60–95’, lift to 9th floor, flat 94.",
    },
    checkOut: {
      time: "10:00",
      instructions:
        "Turn off lights, close windows, turn down heating, lock door. Return keys to KeyNest by 10am.",
    },
    spareKeys: "Lockbox attached to railing under the bridge — code DEMO-CODE.",
    wifi: {
      location: "Hallway mirrored cupboard",
      raw: "Router is located in the hallway mirrored cupboard — see media folder for details.",
    },
    houseRules: [...DEFAULT_HOUSE_RULES],
    laundry:
      "Combi washer/dryer in kitchen. Complimentary white tablets. Drying dial + drying rack available.",
    laundryEscalation: "host",
    waste: "Rubbish bins on level P1 (Car Park 1). Take key fob to re-enter.",
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: {
      lockboxCode: "DEMO-001",
      keyNest: "Guest key at KeyNest",
      accessNotes: "Lockbox under bridge; fob access to building",
    },
    systems: {
      heating: {
        info: "Underfloor heating via wall panels in lounge and bedroom. AC via black control panels. Hot water in hallway mirrored cupboard.",
        escalation: "Call Host",
      },
      alarms: {
        info: "Smoke alarms throughout",
        escalation: "Call emergency services then host",
      },
      breakIn: { escalation: "Call emergency services then host" },
      locksmith: { escalation: "Call Host" },
      drains: { escalation: "Call Host" },
      electrical: {
        info: "Fuse box in hallway mirrored cupboard. Flick downed switches up.",
        escalation: "Call Host",
      },
      leak: { escalation: "Call Host" },
      lifts: {
        info: "Lift requires fob",
        escalation: "If guests are stuck inside Call Host; if not stuck, do not call.",
      },
      waterSupply: { escalation: "Call Host" },
    },
  }),
  propertyWithDefaults({
    id: "bedford-c",
    name: "Bedford C",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "38",
    unit: "Flat C",
    address: "38 Bedford, WC2E 9EU",
    floor: "2nd",
    specificInfo: "Flat C. Intercom code: DEMO-CODE.",
    checkIn: {
      time: "16:00",
      instructions:
        "Use intercom code DEMO-CODE. Collect keys from the Exchange Court lockbox — code DEMO-CODE.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Exchange Court lockbox — code DEMO-CODE.",
    wifi: {
      network: "gigacube-FF6F84",
      password: "DEMO-WIFI-PASS",
      raw: "gigacube-FF6F84 / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: {
      lockboxCode: "DEMO-002",
      doorCode: "DEMO-016",
      accessNotes: "Intercom code DEMO-CODE.",
    },
  }),
  propertyWithDefaults({
    id: "bedford-d",
    name: "Bedford D",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "38",
    unit: "Top Floor Flat",
    address: "38 Bedford, WC2E 9EU",
    floor: "Top floor",
    specificInfo: "Top Floor Flat.",
    checkIn: { time: "16:00", instructions: "Collect keys from the lockbox — code DEMO-CODE." },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — code DEMO-CODE.",
    wifi: {
      network: "PLUSNET-5XGX",
      password: "DEMO-WIFI-PASS",
      raw: "PLUSNET-5XGX / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { lockboxCode: "DEMO-003" },
  }),
  propertyWithDefaults({
    id: "bermondsey",
    name: "Bermondsey",
    type: "Apartment",
    maxGuests: 3,
    buildingNumber: "214",
    unit: "Apartment 3",
    address: "214 Bermondsey Street, SE1 3TQ",
    specificInfo: "Apartment 3.",
    checkIn: {
      time: "16:00",
      instructions:
        "Collect keys from the Abbey Street lockbox — code DEMO-CODE. Emergency code: DEMO-CODE.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Abbey Street lockbox — code DEMO-CODE. Emergency code: DEMO-CODE.",
    wifi: {
      network: "Hyperoptic Fibre 3988",
      password: "DEMO-WIFI-PASS",
      raw: "Hyperoptic Fibre 3988 / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { lockboxCode: "DEMO-004", accessNotes: "Emergency access code: DEMO-CODE." },
  }),
  propertyWithDefaults({
    id: "borough",
    name: "Borough",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "72",
    unit: "Redman House",
    address: "72 Redman House, Lant Street, SE1 1QW",
    specificInfo: "Guest code DEMO-CODE. Check-in code DEMO-CODE. Emergency code DEMO-CODE.",
    checkIn: {
      time: "16:00",
      instructions: "Use check-in code DEMO-CODE. Guest access code is 4069.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    wifi: {
      network: "26A3 Hyperoptic",
      password: "DEMO-WIFI-PASS",
      raw: "26A3 Hyperoptic / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: {
      doorCode: "DEMO-017",
      accessNotes: "Guest code DEMO-CODE; emergency code DEMO-CODE.",
    },
  }),
  propertyWithDefaults({
    id: "chalk-farm",
    name: "Chalk Farm",
    type: "Apartment",
    maxGuests: 4,
    unit: "Flat 20, Duncan House",
    address: "Duncan House, Chalk Farm, London",
    specificInfo: "Flat 20, Duncan House.",
    checkIn: {
      time: "16:00",
      instructions: "Use access code DEMO-CODE. Lockbox code DEMO-CODE; emergency code DEMO-CODE.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — code DEMO-CODE.",
    wifi: { network: "BT-6RFRGQ", password: "DEMO-WIFI-PASS", raw: "BT-6RFRGQ / DEMO-WIFI-PASS" },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: {
      lockboxCode: "DEMO-005",
      doorCode: "DEMO-018",
      accessNotes: "Emergency code: DEMO-CODE.",
    },
  }),
  propertyWithDefaults({
    id: "clerkenwell",
    name: "Clerkenwell",
    type: "Apartment",
    maxGuests: 2,
    buildingNumber: "33",
    unit: "Flat 2",
    address: "33 Seward Street, EC1V 3PA",
    floor: "-1",
    specificInfo: "Flat 2.",
    checkIn: { time: "16:00", instructions: "Collect keys from the lockbox — code DEMO-CODE." },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — code DEMO-CODE.",
    wifi: { network: "SKYQWNW", password: "DEMO-WIFI-PASS", raw: "SKYQWNW / DEMO-WIFI-PASS" },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { lockboxCode: "DEMO-006" },
  }),
  propertyWithDefaults({
    id: "exchange-gardens",
    name: "Exchange Gardens",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "17",
    unit: "Flat 51",
    address: "17 Exchange Gardens, SW8 1BQ",
    floor: "7th",
    specificInfo: "Flat 51.",
    checkIn: { time: "16:00", instructions: "Collect keys from the lockbox — code DEMO-CODE." },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — code DEMO-CODE.",
    wifi: {
      network: "7777 Hyperoptic",
      password: "DEMO-WIFI-PASS",
      raw: "7777 Hyperoptic / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { lockboxCode: "DEMO-007" },
  }),
  propertyWithDefaults({
    id: "farringdon",
    name: "Farringdon",
    type: "Apartment",
    maxGuests: 4,
    unit: "310 City Pavilion",
    address: "310 City Pavilion, Farringdon, London",
    specificInfo: "310 City Pavilion.",
    checkIn: { time: "16:00", instructions: "Follow the property guide for access instructions." },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    wifi: { network: "VM4065504", password: "DEMO-WIFI-PASS", raw: "VM4065504 / DEMO-WIFI-PASS" },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
  }),
  propertyWithDefaults({
    id: "fulham",
    name: "Fulham",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "327",
    unit: "Flat A",
    address: "327 Fulham Palace Road, London",
    specificInfo: "Flat A. Do not lock the bottom lock.",
    checkIn: {
      time: "16:00",
      instructions: "Collect keys from the lockbox — code DEMO-CODE. Do not lock the bottom lock.",
    },
    checkOut: {
      time: "10:00",
      instructions: "Check out by 10:00. Return all keys and do not lock the bottom lock.",
    },
    spareKeys: "Lockbox — code DEMO-CODE. Emergency code: DEMO-CODE.",
    wifi: { network: "SKY7PGUP", password: "DEMO-WIFI-PASS", raw: "SKY7PGUP / DEMO-WIFI-PASS" },
    houseRules: ["Do not lock the bottom lock."],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: {
      lockboxCode: "DEMO-008",
      accessNotes: "Do not lock the bottom lock. Emergency code: DEMO-CODE.",
    },
  }),
  propertyWithDefaults({
    id: "hampstead",
    name: "Hampstead",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "45",
    unit: "Flat 5",
    address: "45 Rosslyn Hill, London",
    specificInfo: "Flat 5.",
    checkIn: { time: "16:00", instructions: "Collect keys from the lockbox — code DEMO-CODE." },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — code DEMO-CODE. Emergency code: DEMO-CODE.",
    wifi: { network: "ALHN-318A", password: "DEMO-WIFI-PASS", raw: "ALHN-318A / DEMO-WIFI-PASS" },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { lockboxCode: "DEMO-009", accessNotes: "Emergency code: DEMO-CODE." },
  }),
  propertyWithDefaults({
    id: "marylebone",
    name: "Marylebone",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "18",
    unit: "Flat 2",
    address: "18 Molineux Street, London",
    specificInfo: "Flat 2. Alarm code: DEMO-CODE.",
    checkIn: {
      time: "16:00",
      instructions: "Collect keys from the lockbox — code DEMO-CODE. Alarm code: DEMO-CODE.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — code DEMO-CODE.",
    wifi: { network: "SKYPPSWV", password: "DEMO-WIFI-PASS", raw: "SKYPPSWV / DEMO-WIFI-PASS" },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { lockboxCode: "DEMO-010", accessNotes: "Alarm code: DEMO-CODE." },
    systems: { alarms: { info: "Alarm code: DEMO-CODE.", escalation: "Call Host" } },
  }),
  propertyWithDefaults({
    id: "mayfair",
    name: "Mayfair",
    type: "Apartment",
    maxGuests: 4,
    unit: "Flat K, Erskine House",
    address: "Erskine House, Mayfair, London",
    specificInfo: "Flat K, Erskine House. Alarm code: DEMO-CODE.",
    checkIn: {
      time: "16:00",
      instructions: "Follow the property guide for access instructions. Alarm code: DEMO-CODE.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    wifi: { network: "erskine", password: "DEMO-WIFI-PASS", raw: "erskine / DEMO-WIFI-PASS" },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    systems: { alarms: { info: "Alarm code: DEMO-CODE.", escalation: "Call Host" } },
  }),
  propertyWithDefaults({
    id: "neckinger",
    name: "Neckinger",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "85",
    unit: "Neckinger Estate",
    address: "85 Neckinger Estate, London",
    specificInfo:
      "Use the check-in lockbox code DEMO-CODE. The keys sheet also references 8569; use 4704 for check-in.",
    checkIn: {
      time: "16:00",
      instructions:
        "Collect keys from the lockbox — code DEMO-CODE. Do not use the conflicting 8569 key-sheet code.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — use check-in code DEMO-CODE. Emergency code: DEMO-CODE.",
    wifi: {
      network: "Missioncontrol",
      password: "DEMO-WIFI-PASS",
      raw: "Missioncontrol / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: {
      lockboxCode: "DEMO-011",
      accessNotes: "Keys sheet also says 8569; use 4704. Emergency code: DEMO-CODE.",
    },
  }),
  propertyWithDefaults({
    id: "notting-hill",
    name: "Notting Hill",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "113",
    unit: "Lower Flat",
    address: "113 Westbourne Park, London",
    floor: "Lower ground",
    specificInfo: "Lower flat.",
    checkIn: {
      time: "16:00",
      instructions:
        "Follow the property guide for access instructions. Emergency lockbox code: DEMO-CODE.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Emergency lockbox — code DEMO-CODE.",
    wifi: {
      network: "Westbourn Park",
      password: "DEMO-WIFI-PASS",
      raw: "Westbourn Park / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { accessNotes: "Emergency lockbox code: DEMO-CODE." },
  }),
  propertyWithDefaults({
    id: "paddington-11",
    name: "Paddington 11",
    type: "House",
    maxGuests: 6,
    buildingNumber: "11",
    address: "11 Norfolk Square Mews, W2 1RZ",
    specificInfo: "Gate code: DEMO-CODE.",
    checkIn: {
      time: "16:00",
      instructions: "Use gate code DEMO-CODE and follow the property guide for entry.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    parking: "Space for one car in the Mews",
    wifi: {
      network: "gigacube-A71195",
      password: "DEMO-WIFI-PASS",
      location: "Top floor bedroom (also BTB-2TK8S2 on ground floor)",
      raw: "Top floor: gigacube-A71195 / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { doorCode: "DEMO-019", accessNotes: "Gate code." },
  }),
  propertyWithDefaults({
    id: "paddington-12",
    name: "Paddington 12",
    type: "House",
    maxGuests: 6,
    buildingNumber: "12",
    address: "12 Norfolk Square Mews, W2 1RZ",
    specificInfo: "Gate code: DEMO-CODE.",
    checkIn: {
      time: "16:00",
      instructions: "Use gate code DEMO-CODE and follow the property guide for entry.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    wifi: {
      network: "BTB-58ZJRS",
      password: "DEMO-WIFI-PASS",
      location: "Ground floor BT; top floor gigacube-645A3A",
      raw: "Ground: BTB-58ZJRS / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { doorCode: "DEMO-020", accessNotes: "Gate code." },
  }),
  propertyWithDefaults({
    id: "pembridge",
    name: "Pembridge",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "45",
    address: "45 Pembridge Gardens, London",
    floor: "1st",
    specificInfo: "First-floor apartment.",
    checkIn: { time: "16:00", instructions: "Collect keys from the lockbox — code DEMO-CODE." },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — code DEMO-CODE. Emergency code: DEMO-CODE.",
    wifi: { network: "BTB-9MCG6K", password: "DEMO-WIFI-PASS", raw: "BTB-9MCG6K / DEMO-WIFI-PASS" },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { lockboxCode: "DEMO-012", accessNotes: "Emergency code: DEMO-CODE." },
  }),
  propertyWithDefaults({
    id: "royal-oak",
    name: "Royal Oak",
    type: "Apartment",
    maxGuests: 4,
    unit: "Flat 28, Finch Lodge",
    address: "Finch Lodge, Royal Oak, London",
    specificInfo: "Use Flat 28; the sheet's unit field incorrectly shows Flat 25.",
    checkIn: {
      time: "16:00",
      instructions: "Follow the property guide for access instructions. Emergency code: DEMO-CODE.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    wifi: {
      network: "Origin_8C01",
      password: "DEMO-WIFI-PASS",
      raw: "Origin_8C01 / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { accessNotes: "Emergency code: DEMO-CODE." },
  }),
  propertyWithDefaults({
    id: "shepherds-bush",
    name: "Shepherd's Bush",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "96",
    unit: "Basement Flat",
    address: "96 Minford Gardens, London",
    floor: "Basement",
    specificInfo: "Basement flat.",
    checkIn: { time: "16:00", instructions: "Collect keys from the lockbox — code DEMO-CODE." },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — code DEMO-CODE. Emergency code: DEMO-CODE.",
    wifi: {
      network: "VodafoneDE7708",
      password: "DEMO-WIFI-PASS",
      raw: "VodafoneDE7708 / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { lockboxCode: "DEMO-013", accessNotes: "Emergency code: DEMO-CODE." },
  }),
  propertyWithDefaults({
    id: "third-avenue",
    name: "Third Avenue",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "139",
    address: "139 Third Avenue, London",
    floor: "Ground",
    specificInfo: "Ground-floor apartment.",
    checkIn: { time: "16:00", instructions: "Collect keys from the lockbox — code DEMO-CODE." },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — code DEMO-CODE. Emergency code: DEMO-CODE.",
    wifi: { location: "Front bedroom", raw: "WiFi router is located in the front bedroom." },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { lockboxCode: "DEMO-014", accessNotes: "Emergency code: DEMO-CODE." },
  }),
  propertyWithDefaults({
    id: "union-street",
    name: "Union Street",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "235",
    unit: "Apartment 8",
    address: "235 Union Street, SE1 0LR",
    floor: "5th",
    specificInfo: "Apartment 8.",
    checkIn: {
      time: "16:00",
      instructions: "Follow the property guide for access instructions. Emergency code: DEMO-CODE.",
    },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    wifi: { network: "SKY03CA7", password: "DEMO-WIFI-PASS", raw: "SKY03CA7 / DEMO-WIFI-PASS" },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { accessNotes: "Emergency code: DEMO-CODE." },
  }),
  propertyWithDefaults({
    id: "vauxhall",
    name: "Vauxhall",
    type: "Apartment",
    maxGuests: 4,
    buildingNumber: "33",
    unit: "Arden House",
    address: "33 Arden House, Vauxhall, London",
    specificInfo: "Arden House.",
    checkIn: { time: "16:00", instructions: "Collect keys from the lockbox — code DEMO-CODE." },
    checkOut: { time: "10:00", instructions: standardCheckOut },
    spareKeys: "Lockbox — code DEMO-CODE. Emergency code: DEMO-CODE.",
    wifi: {
      network: "CommunityFibre10Gb_A9855",
      password: "DEMO-WIFI-PASS",
      raw: "CommunityFibre10Gb_A9855 / DEMO-WIFI-PASS",
    },
    houseRules: [],
    mediaFolderUrl: MEDIA_FOLDER_URL,
    accessSummary: { lockboxCode: "DEMO-015", accessNotes: "Emergency code: DEMO-CODE." },
    systems: {
      drains: {
        info: "See the SIL property guide for the drains procedure.",
        escalation: "Call Host",
      },
    },
  }),
];

export function getPropertyAccessCode(p: Property): string | undefined {
  return p.accessSummary?.lockboxCode || p.accessSummary?.doorCode;
}
