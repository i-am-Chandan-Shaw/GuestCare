import type { EscalationKind, SystemInfo, SystemKey } from "@/shared/types";
import { SYSTEM_KEYS } from "@/features/directory/validations/property-form.schema";

export type PropertyRow = {
  id: string;
  customer_id: string;
  name: string;
  type: string;
  max_guests: number | null;
  building_number: string | null;
  unit: string | null;
  address: string | null;
  postal_code: string | null;
  area: string | null;
  floor: string | null;
  guide_url: string | null;
  listing_url: string | null;
  media_folder_url: string | null;
  image_url: string | null;
  specific_info: string | null;
  check_in_time: string | null;
  check_in_instructions: string | null;
  check_out_time: string | null;
  check_out_instructions: string | null;
  spare_keys: string | null;
  parking: string | null;
  wifi: unknown;
  house_rules: unknown;
  laundry: string | null;
  laundry_escalation: unknown;
  waste: string | null;
  systems: unknown;
  access_summary: unknown;
  created_at: string;
  updated_at: string;
};

export type DirectoryProperty = {
  id: string;
  customerId: string;
  name: string;
  type: string;
  maxGuests?: number;
  buildingNumber?: string;
  unit?: string;
  address: string;
  postalCode?: string;
  area?: string;
  floor?: string;
  guideUrl?: string;
  listingUrl?: string;
  mediaFolderUrl?: string;
  imageUrl?: string;
  specificInfo: string;
  checkIn: { time: string; instructions: string };
  checkOut: { time: string; instructions: string };
  spareKeys?: string;
  parking?: string;
  wifi: {
    network?: string;
    password?: string;
    location?: string;
  };
  houseRules: string[];
  laundry?: string;
  laundryEscalation?: EscalationKind;
  waste?: string;
  systems: Partial<Record<SystemKey, SystemInfo>>;
  accessSummary?: {
    lockboxCode?: string;
    keyNest?: string;
    doorCode?: string;
    accessNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type PropertyListItem = {
  id: string;
  customerId: string;
  name: string;
  type: string;
  maxGuests?: number;
  address: string;
  imageUrl?: string;
  createdAt: string;
};

function optionalText(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toUpperCase() === "NA") return undefined;
  return trimmed;
}

function mapEscalation(raw: unknown): EscalationKind | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "string") {
    if (
      raw === "host" ||
      raw === "emergency-then-host" ||
      raw === "next-day-followup" ||
      raw === "cleaning"
    ) {
      return raw;
    }
    const trimmed = raw.trim();
    return trimmed ? { custom: trimmed } : undefined;
  }
  if (typeof raw === "object" && raw !== null && "custom" in raw) {
    const custom = (raw as { custom: unknown }).custom;
    if (typeof custom === "string") return { custom };
  }
  return undefined;
}

function mapWifi(raw: unknown): DirectoryProperty["wifi"] {
  if (!raw || typeof raw !== "object") return {};
  const row = raw as Record<string, unknown>;
  return {
    location: typeof row.location === "string" ? optionalText(row.location) : undefined,
    network: typeof row.network === "string" ? optionalText(row.network) : undefined,
    password: typeof row.password === "string" ? optionalText(row.password) : undefined,
  };
}

function mapHouseRules(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (typeof item === "string") {
      const text = optionalText(item);
      return text ? [text] : [];
    }
    if (item && typeof item === "object") {
      const label = (item as { label?: unknown }).label;
      if (typeof label === "string") {
        const text = optionalText(label);
        return text ? [text] : [];
      }
    }
    return [];
  });
}

function mapSystems(raw: unknown): Partial<Record<SystemKey, SystemInfo>> {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  const result: Partial<Record<SystemKey, SystemInfo>> = {};

  for (const key of SYSTEM_KEYS) {
    const value = source[key];
    if (!value || typeof value !== "object") continue;
    const row = value as Record<string, unknown>;
    const info = typeof row.info === "string" ? optionalText(row.info) : undefined;
    const escalation = mapEscalation(row.escalation);
    if (!info && !escalation) continue;
    result[key] = {
      ...(info ? { info } : {}),
      ...(escalation ? { escalation } : {}),
    };
  }

  return result;
}

function mapAccessSummary(raw: unknown): DirectoryProperty["accessSummary"] {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  const summary = {
    lockboxCode:
      typeof row.lockboxCode === "string" ? optionalText(row.lockboxCode) : undefined,
    keyNest: typeof row.keyNest === "string" ? optionalText(row.keyNest) : undefined,
    doorCode: typeof row.doorCode === "string" ? optionalText(row.doorCode) : undefined,
    accessNotes:
      typeof row.accessNotes === "string" ? optionalText(row.accessNotes) : undefined,
  };
  if (!summary.lockboxCode && !summary.keyNest && !summary.doorCode && !summary.accessNotes) {
    return undefined;
  }
  return summary;
}

export function mapPropertyRow(row: PropertyRow): DirectoryProperty {
  return {
    id: row.id,
    customerId: row.customer_id,
    name: row.name,
    type: row.type,
    maxGuests: row.max_guests ?? undefined,
    buildingNumber: optionalText(row.building_number),
    unit: optionalText(row.unit),
    address: optionalText(row.address) ?? "",
    postalCode: optionalText(row.postal_code),
    area: optionalText(row.area),
    floor: optionalText(row.floor),
    guideUrl: optionalText(row.guide_url),
    listingUrl: optionalText(row.listing_url),
    mediaFolderUrl: optionalText(row.media_folder_url),
    imageUrl: optionalText(row.image_url),
    specificInfo: optionalText(row.specific_info) ?? "",
    checkIn: {
      time: optionalText(row.check_in_time) ?? "",
      instructions: optionalText(row.check_in_instructions) ?? "",
    },
    checkOut: {
      time: optionalText(row.check_out_time) ?? "",
      instructions: optionalText(row.check_out_instructions) ?? "",
    },
    spareKeys: optionalText(row.spare_keys),
    parking: optionalText(row.parking),
    wifi: mapWifi(row.wifi),
    houseRules: mapHouseRules(row.house_rules),
    laundry: optionalText(row.laundry),
    laundryEscalation: mapEscalation(row.laundry_escalation),
    waste: optionalText(row.waste),
    systems: mapSystems(row.systems),
    accessSummary: mapAccessSummary(row.access_summary),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPropertyListItem(property: DirectoryProperty): PropertyListItem {
  return {
    id: property.id,
    customerId: property.customerId,
    name: property.name,
    type: property.type,
    maxGuests: property.maxGuests,
    address: property.address,
    imageUrl: property.imageUrl,
    createdAt: property.createdAt,
  };
}
