import { createServerFn } from "@tanstack/react-start";
import { canManageAgents } from "@/features/agents/lib/agent-permissions";
import { throwHttpError } from "@/features/directory/lib/server-fn-error";
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
  listProtocolsQuerySchema,
  protocolIdSchema,
  updateProtocolSchema,
  type CreateProtocolInput,
} from "@/features/directory/validations/protocol-form.schema";
import { getAuthSession } from "@/features/auth/server/session";
import { createSupabaseAdmin } from "@/shared/lib/supabase/admin";

async function requireDirectoryManager() {
  const session = await getAuthSession();
  if (!session) throwHttpError("You must be signed in.", 401);
  if (!canManageAgents(session.agent)) {
    throwHttpError("You do not have permission to manage the directory.", 403);
  }
  return session;
}

function protocolWritePayload(data: CreateProtocolInput) {
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
    property_id: data.propertyId,
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

      let query = supabase
        .from("protocols")
        .select("*", { count: "exact" })
        .eq("property_id", data.propertyId);

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
          toProtocolListItem(mapProtocolRow(row)),
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

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, customer_id")
      .eq("id", data.propertyId)
      .maybeSingle();

    if (propertyError) throwHttpError(propertyError.message || "Failed to verify property.", 500);
    if (!property) throwHttpError("Property not found.", 404);

    if (data.customerContactId) {
      const { data: contact, error: contactError } = await supabase
        .from("customer_contacts")
        .select("id")
        .eq("id", data.customerContactId)
        .eq("customer_id", property.customer_id)
        .maybeSingle();

      if (contactError) throwHttpError(contactError.message || "Failed to verify contact.", 500);
      if (!contact) throwHttpError("Contact not found for this customer.", 400);
    }

    const payload = protocolWritePayload(data);
    const { data: row, error } = await supabase
      .from("protocols")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !row) {
      throwHttpError(error?.message ?? "Failed to create protocol.", 500);
    }

    return mapProtocolRow(row as ProtocolRow);
  });

export const updateProtocolFn = createServerFn({ method: "POST" })
  .validator(updateProtocolSchema)
  .handler(async ({ data }): Promise<DirectoryProtocol> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, customer_id")
      .eq("id", data.propertyId)
      .maybeSingle();

    if (propertyError) throwHttpError(propertyError.message || "Failed to verify property.", 500);
    if (!property) throwHttpError("Property not found.", 404);

    if (data.customerContactId) {
      const { data: contact, error: contactError } = await supabase
        .from("customer_contacts")
        .select("id")
        .eq("id", data.customerContactId)
        .eq("customer_id", property.customer_id)
        .maybeSingle();

      if (contactError) throwHttpError(contactError.message || "Failed to verify contact.", 500);
      if (!contact) throwHttpError("Contact not found for this customer.", 400);
    }

    const payload = protocolWritePayload(data);
    const { data: row, error } = await supabase
      .from("protocols")
      .update(payload)
      .eq("id", data.id)
      .eq("property_id", data.propertyId)
      .select("*")
      .single();

    if (error || !row) {
      throwHttpError(error?.message ?? "Failed to update protocol.", 500);
    }

    return mapProtocolRow(row as ProtocolRow);
  });

export const deleteProtocolFn = createServerFn({ method: "POST" })
  .validator(protocolIdSchema)
  .handler(async ({ data }): Promise<{ id: string }> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const { error } = await supabase.from("protocols").delete().eq("id", data.id);
    if (error) throwHttpError(error.message || "Failed to delete protocol.", 500);

    return { id: data.id };
  });
