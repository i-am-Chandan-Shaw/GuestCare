import { z } from "zod";
import type { SystemKey } from "@/shared/types";

const SYSTEM_KEYS = [
  "heating",
  "alarms",
  "breakIn",
  "locksmith",
  "drains",
  "emergencyLights",
  "electrical",
  "gas",
  "leak",
  "lifts",
  "waterSupply",
] as const satisfies readonly SystemKey[];

const escalationSchema = z.union([
  z.literal("host"),
  z.literal("emergency-then-host"),
  z.literal("next-day-followup"),
  z.literal("cleaning"),
  z.object({ custom: z.string() }),
]);

const wifiSchema = z.object({
  location: z.string().optional(),
  network: z.string().optional(),
  password: z.string().optional(),
});

const accessSummarySchema = z.object({
  lockboxCode: z.string().optional(),
  keyNest: z.string().optional(),
  doorCode: z.string().optional(),
  accessNotes: z.string().optional(),
});

const systemInfoSchema = z.object({
  info: z.string().optional(),
  escalation: escalationSchema.optional(),
});

const systemsSchema = z.record(z.enum(SYSTEM_KEYS), systemInfoSchema);

const propertyFieldsSchema = z.object({
  customerId: z.string().uuid("Invalid customer id."),
  name: z.string().trim().min(1, "Name is required."),
  type: z.string().trim().min(1, "Type is required."),
  maxGuests: z.number().int().nonnegative().optional(),
  buildingNumber: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  address: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  area: z.string().trim().optional(),
  floor: z.string().trim().optional(),
  guideUrl: z.string().trim().optional(),
  listingUrl: z.string().trim().optional(),
  mediaFolderUrl: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  specificInfo: z.string().trim().optional(),
  checkInTime: z.string().trim().optional(),
  checkInInstructions: z.string().trim().optional(),
  checkOutTime: z.string().trim().optional(),
  checkOutInstructions: z.string().trim().optional(),
  spareKeys: z.string().trim().optional(),
  parking: z.string().trim().optional(),
  wifi: wifiSchema.optional(),
  houseRules: z.array(z.string()),
  laundry: z.string().trim().optional(),
  laundryEscalation: escalationSchema.optional(),
  waste: z.string().trim().optional(),
  systems: systemsSchema.optional(),
  accessSummary: accessSummarySchema.optional(),
});

export const createPropertySchema = propertyFieldsSchema;

export const updatePropertySchema = propertyFieldsSchema.extend({
  id: z.string().uuid("Invalid property id."),
});

export const listPropertiesQuerySchema = z.object({
  customerId: z.string().uuid("Invalid customer id."),
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
  search: z.string().optional(),
});

export const propertyIdSchema = z.object({
  id: z.string().uuid("Invalid property id."),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export { SYSTEM_KEYS };
