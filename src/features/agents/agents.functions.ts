import { createServerFn } from "@tanstack/react-start";
import {
  canEditAgent,
  canManageAgents,
  creatableRoles,
  validateCustomerScope,
} from "@/features/agents/lib/agent-permissions";
import { mapAgentRow, type AgentRow } from "@/features/agents/lib/map-agent-row";
import { throwHttpError } from "@/shared/lib/server-fn-error";
import { createAgentSchema, updateAgentSchema } from "@/features/agents/create-agent.schema";
import { isPasswordStrong } from "@/features/agents/validations/agent-form.schema";
import { getAuthSession } from "@/features/auth/server/session";
import { createSupabaseAdmin } from "@/shared/lib/supabase/admin";
import type { Agent } from "@/shared/types/agent";

async function fetchAllCustomerIds(): Promise<string[]> {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase.from("customers").select("id");
  return (data ?? []).map((row) => row.id);
}

const WEAK_PASSWORD_ERROR =
  "Password must be 8+ characters with uppercase, number, and special character.";

const DUPLICATE_EMAIL_ERROR = "An agent with this email already exists.";

function isDuplicateAuthError(message: string, status?: number): boolean {
  const normalized = message.toLowerCase();
  return (
    status === 422 ||
    status === 409 ||
    normalized.includes("already") ||
    normalized.includes("registered") ||
    normalized.includes("exists")
  );
}

export const listAgentsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Agent[]> => {
    const session = await getAuthSession();
    if (!session) throwHttpError("You must be signed in to view agents.", 401);

    if (!canManageAgents(session.agent)) {
      throwHttpError("You do not have permission to view agents.", 403);
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.from("agents").select("*").order("name");

    if (error) {
      throwHttpError(error.message || "Failed to load agents.", 500);
    }

    return (data ?? []).map((row) => mapAgentRow(row as AgentRow));
  },
);

export const createAgentFn = createServerFn({ method: "POST" })
  .validator(createAgentSchema)
  .handler(async ({ data }): Promise<Agent> => {
    const session = await getAuthSession();
    if (!session) throwHttpError("You must be signed in to create agents.", 401);

    const currentAgent = session.agent;
    if (!canManageAgents(currentAgent)) {
      throwHttpError("You do not have permission to create agents.", 403);
    }

    const allowedRoles = creatableRoles(currentAgent);
    if (!allowedRoles.includes(data.role)) {
      throwHttpError("You cannot create an agent with that role.", 403);
    }

    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();

    if (!isPasswordStrong(password)) {
      throwHttpError(WEAK_PASSWORD_ERROR, 400);
    }

    const allCustomerIds = await fetchAllCustomerIds();
    const scopeError = validateCustomerScope(currentAgent, data.customerScope, allCustomerIds);
    if (scopeError) throwHttpError(scopeError, 400);

    const supabase = createSupabaseAdmin();

    const { data: existing, error: existingError } = await supabase
      .from("agents")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      throwHttpError(existingError.message || "Failed to check existing agents.", 500);
    }
    if (existing) {
      throwHttpError(DUPLICATE_EMAIL_ERROR, 409);
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError || !authData.user) {
      const message = authError?.message ?? "Failed to create auth user.";
      const status = (authError as { status?: number } | null)?.status;
      if (isDuplicateAuthError(message, status)) {
        throwHttpError(DUPLICATE_EMAIL_ERROR, 409);
      }
      throwHttpError(message, 500);
    }

    const userId = authData.user.id;
    const isActive = data.isActive ?? true;

    const { data: row, error: insertError } = await supabase
      .from("agents")
      .insert({
        id: userId,
        name,
        email,
        role: data.role,
        is_active: isActive,
        customer_scope: data.customerScope,
      })
      .select("*")
      .single();

    if (insertError || !row) {
      await supabase.auth.admin.deleteUser(userId);
      if (insertError?.code === "23505") {
        throwHttpError(DUPLICATE_EMAIL_ERROR, 409);
      }
      throwHttpError(insertError?.message ?? "Failed to create agent profile.", 500);
    }

    return mapAgentRow(row as AgentRow);
  });

export const updateAgentFn = createServerFn({ method: "POST" })
  .validator(updateAgentSchema)
  .handler(async ({ data }): Promise<Agent> => {
    const session = await getAuthSession();
    if (!session) throwHttpError("You must be signed in to update agents.", 401);

    const currentAgent = session.agent;
    const supabase = createSupabaseAdmin();

    const { data: existingRow, error: loadError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (loadError) {
      throwHttpError(loadError.message || "Failed to load agent.", 500);
    }
    if (!existingRow) throwHttpError("Agent not found.", 404);

    const target = mapAgentRow(existingRow as AgentRow);

    if (!canEditAgent(currentAgent, target)) {
      throwHttpError("You do not have permission to edit this agent.", 403);
    }

    const allowedRoles = creatableRoles(currentAgent);
    if (!allowedRoles.includes(data.role)) {
      throwHttpError("You cannot assign that role.", 403);
    }

    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password?.trim();

    if (currentAgent.id === data.id) {
      if (data.role !== target.role) {
        throwHttpError("You cannot change your own role.", 400);
      }
      if (!data.isActive) {
        throwHttpError("You cannot deactivate your own account.", 400);
      }
    }

    const allCustomerIds = await fetchAllCustomerIds();
    const scopeError = validateCustomerScope(currentAgent, data.customerScope, allCustomerIds);
    if (scopeError) throwHttpError(scopeError, 400);

    if (password && !isPasswordStrong(password)) {
      throwHttpError(WEAK_PASSWORD_ERROR, 400);
    }

    const { data: emailOwner, error: emailCheckError } = await supabase
      .from("agents")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (emailCheckError) {
      throwHttpError(emailCheckError.message || "Failed to check email.", 500);
    }
    if (emailOwner && emailOwner.id !== data.id) {
      throwHttpError(DUPLICATE_EMAIL_ERROR, 409);
    }

    const authPatch: {
      email?: string;
      password?: string;
      user_metadata?: { name: string };
    } = {};
    if (email !== target.email) authPatch.email = email;
    if (password) authPatch.password = password;
    if (name !== target.name) authPatch.user_metadata = { name };

    if (Object.keys(authPatch).length > 0) {
      const { error: authError } = await supabase.auth.admin.updateUserById(data.id, authPatch);
      if (authError) {
        const message = authError.message || "Failed to update auth user.";
        const status = (authError as { status?: number } | null)?.status;
        if (isDuplicateAuthError(message, status)) {
          throwHttpError(DUPLICATE_EMAIL_ERROR, 409);
        }
        throwHttpError(message, 500);
      }
    }

    const { data: row, error: updateError } = await supabase
      .from("agents")
      .update({
        name,
        email,
        role: data.role,
        is_active: data.isActive,
        customer_scope: data.customerScope,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("*")
      .single();

    if (updateError || !row) {
      if (updateError?.code === "23505") {
        throwHttpError(DUPLICATE_EMAIL_ERROR, 409);
      }
      throwHttpError(updateError?.message ?? "Failed to update agent.", 500);
    }

    return mapAgentRow(row as AgentRow);
  });
