import { createServerFn } from "@tanstack/react-start";
import { canManageAgents } from "@/features/agents/lib/agent-permissions";
import { throwHttpError } from "@/features/directory/lib/server-fn-error";
import {
  mapCustomerRow,
  toCustomerListItem,
  type CustomerContactRow,
  type CustomerRow,
  type CustomerListItem,
  type DirectoryCustomer,
} from "@/features/directory/lib/map-customer-row";
import {
  createCustomerSchema,
  customerIdSchema,
  listCustomersQuerySchema,
  updateCustomerSchema,
  type CreateCustomerInput,
} from "@/features/directory/validations/customer-form.schema";
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

async function loadContacts(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  customerId: string,
): Promise<CustomerContactRow[]> {
  const { data, error } = await supabase
    .from("customer_contacts")
    .select("*")
    .eq("customer_id", customerId)
    .order("position");

  if (error) throwHttpError(error.message || "Failed to load contacts.", 500);
  return (data ?? []) as CustomerContactRow[];
}

async function replaceContacts(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  customerId: string,
  contacts: CreateCustomerInput["contacts"],
) {
  const { error: deleteError } = await supabase
    .from("customer_contacts")
    .delete()
    .eq("customer_id", customerId);

  if (deleteError) throwHttpError(deleteError.message || "Failed to update contacts.", 500);

  const rows = contacts
    .map((contact, index) => ({
      id: contact.id,
      customer_id: customerId,
      label: contact.label.trim(),
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      position: index,
    }))
    .filter((row) => row.label || row.name || row.phone);

  if (rows.length === 0) return;

  const { error: insertError } = await supabase.from("customer_contacts").insert(rows);
  if (insertError) throwHttpError(insertError.message || "Failed to save contacts.", 500);
}

function customerWritePayload(data: CreateCustomerInput) {
  const steps = data.guestVerificationSteps
    .map((step, index) => ({
      id: step.id,
      label: step.label.trim(),
      hint: step.hint?.trim() || undefined,
      position: index,
    }))
    .filter((step) => step.label);

  return {
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    image_url: data.imageUrl?.trim() || null,
    pms_url: data.pmsUrl?.trim() || null,
    pms_username: data.pmsUsername?.trim() || null,
    pms_password: data.pmsPassword?.trim() || null,
    guest_verification_steps: steps,
    updated_at: new Date().toISOString(),
  };
}

export const listCustomersFn = createServerFn({ method: "POST" })
  .validator(listCustomersQuerySchema)
  .handler(
    async ({
      data,
    }): Promise<{
      data: CustomerListItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }> => {
      await requireDirectoryManager();
      const supabase = createSupabaseAdmin();
      const search = (data.search?.trim() ?? "").replace(/[,()]/g, "");

      let query = supabase.from("customers").select("*", { count: "exact" });

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
        );
      }

      const from = (data.page - 1) * data.limit;
      const to = from + data.limit - 1;

      const { data: rows, error, count } = await query
        .order("name")
        .range(from, to);

      if (error) throwHttpError(error.message || "Failed to load customers.", 500);

      const customerRows = (rows ?? []) as CustomerRow[];
      const ids = customerRows.map((row) => row.id);

      let contactsByCustomer = new Map<string, CustomerContactRow[]>();
      if (ids.length > 0) {
        const { data: contactRows, error: contactsError } = await supabase
          .from("customer_contacts")
          .select("*")
          .in("customer_id", ids);

        if (contactsError) {
          throwHttpError(contactsError.message || "Failed to load contacts.", 500);
        }

        contactsByCustomer = (contactRows as CustomerContactRow[] | null)?.reduce(
          (map, row) => {
            const list = map.get(row.customer_id) ?? [];
            list.push(row);
            map.set(row.customer_id, list);
            return map;
          },
          new Map<string, CustomerContactRow[]>(),
        ) ?? new Map();
      }

      const total = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / data.limit));

      return {
        data: customerRows.map((row) =>
          toCustomerListItem(mapCustomerRow(row, contactsByCustomer.get(row.id) ?? [])),
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

export const getCustomerFn = createServerFn({ method: "GET" })
  .validator(customerIdSchema)
  .handler(async ({ data }): Promise<DirectoryCustomer> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const { data: row, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (error) throwHttpError(error.message || "Failed to load customer.", 500);
    if (!row) throwHttpError("Customer not found.", 404);

    const contacts = await loadContacts(supabase, data.id);
    return mapCustomerRow(row as CustomerRow, contacts);
  });

export const createCustomerFn = createServerFn({ method: "POST" })
  .validator(createCustomerSchema)
  .handler(async ({ data }): Promise<DirectoryCustomer> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();
    const payload = customerWritePayload(data);

    const { data: row, error } = await supabase
      .from("customers")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error || !row) {
      throwHttpError(error?.message ?? "Failed to create customer.", 500);
    }

    await replaceContacts(supabase, row.id, data.contacts);
    const contacts = await loadContacts(supabase, row.id);
    return mapCustomerRow(row as CustomerRow, contacts);
  });

export const updateCustomerFn = createServerFn({ method: "POST" })
  .validator(updateCustomerSchema)
  .handler(async ({ data }): Promise<DirectoryCustomer> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();
    const payload = customerWritePayload(data);

    const { data: row, error } = await supabase
      .from("customers")
      .update(payload)
      .eq("id", data.id)
      .select("*")
      .single();

    if (error || !row) {
      throwHttpError(error?.message ?? "Failed to update customer.", 500);
    }

    await replaceContacts(supabase, data.id, data.contacts);
    const contacts = await loadContacts(supabase, data.id);
    return mapCustomerRow(row as CustomerRow, contacts);
  });

export const deleteCustomerFn = createServerFn({ method: "POST" })
  .validator(customerIdSchema)
  .handler(async ({ data }): Promise<{ id: string }> => {
    await requireDirectoryManager();
    const supabase = createSupabaseAdmin();

    const { error } = await supabase.from("customers").delete().eq("id", data.id);
    if (error) throwHttpError(error.message || "Failed to delete customer.", 500);

    return { id: data.id };
  });
