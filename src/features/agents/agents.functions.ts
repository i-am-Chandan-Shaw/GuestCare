import { createServerFn } from "@tanstack/react-start";
import {
  canManageAgents,
  creatableRoles,
  validateCustomerScopeForActor,
} from "@/features/agents/lib/agent-permissions";
import { mapAgentRow, type AgentRow } from "@/features/agents/lib/map-agent-row";
import { throwHttpError } from "@/features/agents/lib/server-fn-error";
import { createAgentSchema } from "@/features/agents/create-agent.schema";
import { isPasswordStrong } from "@/features/agents/validations/agent-form.schema";
import { getAuthSession } from "@/features/auth/server/session";
import { createSupabaseAdmin } from "@/shared/lib/supabase/admin";
import type { Agent } from "@/shared/types/agent";

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

export const createAgentFn = createServerFn({ method: "POST" })
  .validator(createAgentSchema)
  .handler(async ({ data }): Promise<Agent> => {
    const session = await getAuthSession();
    if (!session) throwHttpError("You must be signed in to create agents.", 401);

    const actor = session.agent;
    if (!canManageAgents(actor)) {
      throwHttpError("You do not have permission to create agents.", 403);
    }

    const allowedRoles = creatableRoles(actor);
    if (!allowedRoles.includes(data.role)) {
      throwHttpError("You cannot create an agent with that role.", 403);
    }

    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password.trim();

    if (!isPasswordStrong(password)) {
      throwHttpError(WEAK_PASSWORD_ERROR, 400);
    }

    const scopeError = validateCustomerScopeForActor(actor, data.customerScope);
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
