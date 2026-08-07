import { createServerFn } from "@tanstack/react-start";
import { throwHttpError } from "@/shared/lib/server-fn-error";
import { requireDirectoryManager } from "@/shared/lib/server-auth";
import { priorityFromCategory } from "@/features/directory/lib/priority-from-category";
import {
  mapProtocolRow,
  toProtocolListItem,
  type DirectoryProtocol,
  type ProtocolListItem,
  type ProtocolRow,
} from "@/features/directory/lib/map-protocol-row";
import {
  createProtocolSchema,
  deleteProtocolSchema,
  linkProtocolToPropertiesSchema,
  listProtocolsQuerySchema,
  protocolIdSchema,
  updateProtocolSchema,
  type CreateProtocolInput,
} from "@/features/directory/validations/protocol-form.schema";
import { createSupabaseAdmin } from "@/shared/lib/supabase/admin";

function protocolContentPayload(data: CreateProtocolInput) {
  const steps = data.steps
    .map((step, index) => ({
      id: step.id,
      label: step.label.trim(),
      hint: step.hint?.trim() || undefined,
      position: index,
    }))
    .filter((step) => step.label);

  const customerContactId = data.customerContactId ?? null;
  const escalationKind = customerContactId ? null : (data.escalationKind ?? null);
  const escalationDetails =
    escalationKind === "custom" ? data.escalationDetails?.trim() || null : null;

  return {
    category: data.category.trim(),
    name: data.name.trim(),
    reservation_verification: data.reservationVerification,
    priority_category: data.priorityCategory,
    priority: priorityFromCategory(data.priorityCategory),
    steps,
    customer_contact_id: customerContactId,
    escalation_kind: escalationKind,
    escalation_details: escalationDetails,
    updated_at: new Date().toISOString(),
  };
}

async function verifyPropertyAndContact(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  propertyId: string,
  customerContactId?: string | null,
) {
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, customer_id")
    .eq("id", propertyId)
    .maybeSingle();

  if (propertyError) throwHttpError(propertyError.message || "Failed to verify property.", 500);
  if (!property) throwHttpError("Property not found.", 404);

  if (customerContactId) {
    const { data: contact, error: contactError } = await supabase
      .from("customer_contacts")
      .select("id")
      .eq("id", customerContactId)
      .eq("customer_id", property.customer_id)
      .maybeSingle();

    if (contactError) throwHttpError(contactError.message || "Failed to verify contact.", 500);
    if (!contact) throwHttpError("Contact not found for this customer.", 400);
  }

  return property as { id: string; customer_id: string };
}

export const listProtocolsFn = createServerFn({ method: "POST" })
  .validator(listProtocolsQuerySchema)
  .handler(
    async ({
      data,
    }): Promise<{
      data: ProtocolListItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }> => {
      await requireDirectoryManager();
      const supabase = createSupabaseAdmin();
      const search = (data.search?.trim() ?? "").replace(/[,()]/g, "");

      const { data: links, error: linkError } = await supabase
        .from("property_protocols")
        .select("protocol_id")
        .eq("property_id", data.propertyId);

      if (linkError) throwHttpError(linkError.message || "Failed to load protocol links.", 500);

      const protocolIds = (links ?? []).map((link) => link.protocol_id as string);
      if (protocolIds.length === 0) {
        return {
          data: [],
          pagination: { page: data.page, limit: data.limit, total: 0, totalPages: 1 },
        };
      }

      let query = supabase.from("protocols").select("*", { count: "exact" }).in("id", protocolIds);

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,category.ilike.%${search}%,priority.ilike.%${search}%`,
        );
      }

      const from = (data.page - 1) * data.limit;
      const to = from + data.limit - 1;

      const { data: rows, error, count } = await query.order("name").range(from, to);
      if (error) throwHttpError(error.message || "Failed to load protocols.", 500);

      const total = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / data.limit));

      return {
        data: ((rows ?? []) as ProtocolRow[]).map((row) =>
          toProtocolListItem(mapProtocolRow(row, data.propertyId)),
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

export const getProtocolFn = createServerFn({ method: "GET" })
  .validator(protocolIdSchema)
  .handler(async ({ data }): Promise<DirectoryProtocol> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const { data: row, error } = await supabase
      .from("protocols")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (error) throwHttpError(error.message || "Failed to load protocol.", 500);
    if (!row) throwHttpError("Protocol not found.", 404);

    return mapProtocolRow(row as ProtocolRow);
  });

export const createProtocolFn = createServerFn({ method: "POST" })
  .validator(createProtocolSchema)
  .handler(async ({ data }): Promise<DirectoryProtocol> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const property = await verifyPropertyAndContact(
      supabase,
      data.propertyId,
      data.customerContactId,
    );

    const content = protocolContentPayload(data);
    const { data: row, error } = await supabase
      .from("protocols")
      .insert({
        ...content,
        customer_id: property.customer_id,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !row) {
      throwHttpError(error?.message ?? "Failed to create protocol.", 500);
    }

    const { error: linkError } = await supabase.from("property_protocols").insert({
      property_id: data.propertyId,
      protocol_id: (row as ProtocolRow).id,
    });

    if (linkError) {
      await supabase.from("protocols").delete().eq("id", (row as ProtocolRow).id);
      throwHttpError(linkError.message || "Failed to link protocol to property.", 500);
    }

    return mapProtocolRow(row as ProtocolRow, data.propertyId);
  });

export const linkProtocolToPropertiesFn = createServerFn({ method: "POST" })
  .validator(linkProtocolToPropertiesSchema)
  .handler(async ({ data }): Promise<{ linked: number }> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const { data: protocol, error: protocolError } = await supabase
      .from("protocols")
      .select("id, customer_id")
      .eq("id", data.protocolId)
      .maybeSingle();

    if (protocolError) throwHttpError(protocolError.message || "Failed to load protocol.", 500);
    if (!protocol) throwHttpError("Protocol not found.", 404);

    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id, customer_id")
      .in("id", data.propertyIds);

    if (propertiesError) {
      throwHttpError(propertiesError.message || "Failed to verify properties.", 500);
    }

    const rows = properties ?? [];
    if (rows.length !== data.propertyIds.length) {
      throwHttpError("One or more properties were not found.", 404);
    }

    const customerId = (protocol as { customer_id: string }).customer_id;
    if (rows.some((property) => property.customer_id !== customerId)) {
      throwHttpError("All properties must belong to the same customer as the protocol.", 400);
    }

    const { error: linkError } = await supabase.from("property_protocols").upsert(
      data.propertyIds.map((propertyId) => ({
        property_id: propertyId,
        protocol_id: data.protocolId,
      })),
      { onConflict: "property_id,protocol_id", ignoreDuplicates: true },
    );

    if (linkError) throwHttpError(linkError.message || "Failed to link protocols.", 500);

    return { linked: data.propertyIds.length };
  });

export const updateProtocolFn = createServerFn({ method: "POST" })
  .validator(updateProtocolSchema)
  .handler(async ({ data }): Promise<DirectoryProtocol> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const property = await verifyPropertyAndContact(
      supabase,
      data.propertyId,
      data.customerContactId,
    );

    const { data: link, error: linkError } = await supabase
      .from("property_protocols")
      .select("protocol_id")
      .eq("property_id", data.propertyId)
      .eq("protocol_id", data.id)
      .maybeSingle();

    if (linkError) throwHttpError(linkError.message || "Failed to verify protocol link.", 500);
    if (!link) throwHttpError("Protocol is not linked to this property.", 404);

    const { count, error: countError } = await supabase
      .from("property_protocols")
      .select("protocol_id", { count: "exact", head: true })
      .eq("protocol_id", data.id);

    if (countError) throwHttpError(countError.message || "Failed to check protocol sharing.", 500);

    const content = protocolContentPayload(data);
    const linkCount = count ?? 0;

    // Shared across properties → copy-on-write for this property only.
    if (linkCount > 1) {
      const { data: cloned, error: cloneError } = await supabase
        .from("protocols")
        .insert({
          ...content,
          customer_id: property.customer_id,
          created_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (cloneError || !cloned) {
        throwHttpError(cloneError?.message ?? "Failed to clone protocol.", 500);
      }

      const { error: unlinkError } = await supabase
        .from("property_protocols")
        .delete()
        .eq("property_id", data.propertyId)
        .eq("protocol_id", data.id);

      if (unlinkError) {
        await supabase.from("protocols").delete().eq("id", (cloned as ProtocolRow).id);
        throwHttpError(unlinkError.message || "Failed to unlink shared protocol.", 500);
      }

      const { error: relinkError } = await supabase.from("property_protocols").insert({
        property_id: data.propertyId,
        protocol_id: (cloned as ProtocolRow).id,
      });

      if (relinkError) {
        // Best-effort restore of original link if re-link fails.
        await supabase.from("property_protocols").insert({
          property_id: data.propertyId,
          protocol_id: data.id,
        });
        await supabase.from("protocols").delete().eq("id", (cloned as ProtocolRow).id);
        throwHttpError(relinkError.message || "Failed to link cloned protocol.", 500);
      }

      return mapProtocolRow(cloned as ProtocolRow, data.propertyId);
    }

    const { data: row, error } = await supabase
      .from("protocols")
      .update(content)
      .eq("id", data.id)
      .eq("customer_id", property.customer_id)
      .select("*")
      .single();

    if (error || !row) {
      throwHttpError(error?.message ?? "Failed to update protocol.", 500);
    }

    return mapProtocolRow(row as ProtocolRow, data.propertyId);
  });

export const deleteProtocolFn = createServerFn({ method: "POST" })
  .validator(deleteProtocolSchema)
  .handler(async ({ data }): Promise<{ id: string }> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const { error: unlinkError } = await supabase
      .from("property_protocols")
      .delete()
      .eq("property_id", data.propertyId)
      .eq("protocol_id", data.id);

    if (unlinkError) throwHttpError(unlinkError.message || "Failed to unlink protocol.", 500);

    const { count, error: countError } = await supabase
      .from("property_protocols")
      .select("protocol_id", { count: "exact", head: true })
      .eq("protocol_id", data.id);

    if (countError) throwHttpError(countError.message || "Failed to check remaining links.", 500);

    if ((count ?? 0) === 0) {
      const { error: deleteError } = await supabase.from("protocols").delete().eq("id", data.id);
      if (deleteError) throwHttpError(deleteError.message || "Failed to delete protocol.", 500);
    }

    return { id: data.id };
  });
