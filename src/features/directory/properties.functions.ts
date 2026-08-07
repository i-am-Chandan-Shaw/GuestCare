import { createServerFn } from "@tanstack/react-start";
import { throwHttpError } from "@/shared/lib/server-fn-error";
import { requireDirectoryManager } from "@/shared/lib/server-auth";
import {
  mapPropertyRow,
  toPropertyListItem,
  type DirectoryProperty,
  type PropertyListItem,
  type PropertyRow,
} from "@/features/directory/lib/map-property-row";
import {
  createPropertySchema,
  listPropertiesQuerySchema,
  propertyIdSchema,
  updatePropertySchema,
  type CreatePropertyInput,
} from "@/features/directory/validations/property-form.schema";
import { createSupabaseAdmin } from "@/shared/lib/supabase/admin";
import type { EscalationKind, SystemInfo, SystemKey } from "@/shared/types";

function cleanText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.toUpperCase() === "NA") return null;
  return trimmed;
}

function cleanEscalation(value: EscalationKind | undefined): EscalationKind | null {
  if (!value) return null;
  if (typeof value === "object") {
    const custom = value.custom.trim();
    return custom ? { custom } : null;
  }
  return value;
}

function cleanWifi(wifi: CreatePropertyInput["wifi"]) {
  if (!wifi) return {};
  const location = cleanText(wifi.location);
  const network = cleanText(wifi.network);
  const password = cleanText(wifi.password);
  return {
    ...(location ? { location } : {}),
    ...(network ? { network } : {}),
    ...(password ? { password } : {}),
  };
}

function cleanAccessSummary(summary: CreatePropertyInput["accessSummary"]) {
  if (!summary) return null;
  const lockboxCode = cleanText(summary.lockboxCode);
  const keyNest = cleanText(summary.keyNest);
  const doorCode = cleanText(summary.doorCode);
  const accessNotes = cleanText(summary.accessNotes);
  if (!lockboxCode && !keyNest && !doorCode && !accessNotes) return null;
  return {
    ...(lockboxCode ? { lockboxCode } : {}),
    ...(keyNest ? { keyNest } : {}),
    ...(doorCode ? { doorCode } : {}),
    ...(accessNotes ? { accessNotes } : {}),
  };
}

function cleanSystems(
  systems: CreatePropertyInput["systems"],
): Partial<Record<SystemKey, SystemInfo>> {
  if (!systems) return {};
  const result: Partial<Record<SystemKey, SystemInfo>> = {};
  for (const [key, value] of Object.entries(systems)) {
    if (!value) continue;
    const info = cleanText(value.info) ?? undefined;
    const escalation = cleanEscalation(value.escalation) ?? undefined;
    if (!info && !escalation) continue;
    result[key as SystemKey] = {
      ...(info ? { info } : {}),
      ...(escalation ? { escalation } : {}),
    };
  }
  return result;
}

function propertyWritePayload(data: CreatePropertyInput) {
  const houseRules = data.houseRules
    .map((rule) => rule.trim())
    .filter((rule) => rule && rule.toUpperCase() !== "NA");

  return {
    customer_id: data.customerId,
    name: data.name.trim(),
    type: data.type.trim(),
    max_guests: data.maxGuests ?? null,
    building_number: cleanText(data.buildingNumber),
    unit: cleanText(data.unit),
    address: cleanText(data.address),
    postal_code: cleanText(data.postalCode),
    area: cleanText(data.area),
    floor: cleanText(data.floor),
    guide_url: cleanText(data.guideUrl),
    listing_url: cleanText(data.listingUrl),
    media_folder_url: cleanText(data.mediaFolderUrl),
    image_url: cleanText(data.imageUrl),
    specific_info: cleanText(data.specificInfo),
    check_in_time: cleanText(data.checkInTime),
    check_in_instructions: cleanText(data.checkInInstructions),
    check_out_time: cleanText(data.checkOutTime),
    check_out_instructions: cleanText(data.checkOutInstructions),
    spare_keys: cleanText(data.spareKeys),
    parking: cleanText(data.parking),
    wifi: cleanWifi(data.wifi),
    house_rules: houseRules,
    laundry: cleanText(data.laundry),
    laundry_escalation: cleanEscalation(data.laundryEscalation),
    waste: cleanText(data.waste),
    systems: cleanSystems(data.systems),
    access_summary: cleanAccessSummary(data.accessSummary),
    updated_at: new Date().toISOString(),
  };
}

export const listPropertiesFn = createServerFn({ method: "POST" })
  .validator(listPropertiesQuerySchema)
  .handler(
    async ({
      data,
    }): Promise<{
      data: PropertyListItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }> => {
      await requireDirectoryManager();
      const supabase = createSupabaseAdmin();
      const search = (data.search?.trim() ?? "").replace(/[,()]/g, "");

      let query = supabase
        .from("properties")
        .select("*", { count: "exact" })
        .eq("customer_id", data.customerId);

      if (search) {
        query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,type.ilike.%${search}%`);
      }

      const from = (data.page - 1) * data.limit;
      const to = from + data.limit - 1;

      const { data: rows, error, count } = await query.order("name").range(from, to);
      if (error) throwHttpError(error.message || "Failed to load properties.", 500);

      const total = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / data.limit));

      return {
        data: ((rows ?? []) as PropertyRow[]).map((row) =>
          toPropertyListItem(mapPropertyRow(row)),
        ),
        pagination: {
          page: data.page,
          limit: data.limit,
          total,
          totalPages,
        },
      };
    },
  );

export const getPropertyFn = createServerFn({ method: "GET" })
  .validator(propertyIdSchema)
  .handler(async ({ data }): Promise<DirectoryProperty> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const { data: row, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (error) throwHttpError(error.message || "Failed to load property.", 500);
    if (!row) throwHttpError("Property not found.", 404);

    return mapPropertyRow(row as PropertyRow);
  });

export const createPropertyFn = createServerFn({ method: "POST" })
  .validator(createPropertySchema)
  .handler(async ({ data }): Promise<DirectoryProperty> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("id", data.customerId)
      .maybeSingle();

    if (customerError) throwHttpError(customerError.message || "Failed to verify customer.", 500);
    if (!customer) throwHttpError("Customer not found.", 404);

    const payload = propertyWritePayload(data);
    const { data: row, error } = await supabase
      .from("properties")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !row) {
      throwHttpError(error?.message ?? "Failed to create property.", 500);
    }

    return mapPropertyRow(row as PropertyRow);
  });

export const updatePropertyFn = createServerFn({ method: "POST" })
  .validator(updatePropertySchema)
  .handler(async ({ data }): Promise<DirectoryProperty> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();
    const payload = propertyWritePayload(data);

    const { data: row, error } = await supabase
      .from("properties")
      .update(payload)
      .eq("id", data.id)
      .eq("customer_id", data.customerId)
      .select("*")
      .single();

    if (error || !row) {
      throwHttpError(error?.message ?? "Failed to update property.", 500);
    }

    return mapPropertyRow(row as PropertyRow);
  });

export const deletePropertyFn = createServerFn({ method: "POST" })
  .validator(propertyIdSchema)
  .handler(async ({ data }): Promise<{ id: string }> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const { error } = await supabase.from("properties").delete().eq("id", data.id);
    if (error) throwHttpError(error.message || "Failed to delete property.", 500);

    return { id: data.id };
  });
