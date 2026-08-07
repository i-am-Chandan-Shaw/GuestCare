import { createServerFn } from "@tanstack/react-start";
import { throwHttpError } from "@/shared/lib/server-fn-error";
import { loginSchema } from "@/features/auth/lib/login-schema";
import {
  clearAuthCookies,
  getAuthSession,
  setAuthCookies,
} from "@/features/auth/server/session";
import { createSupabaseServer } from "@/shared/lib/supabase/server";
import { createSupabaseAdmin } from "@/shared/lib/supabase/admin";
import { mapAgentRow, type AgentRow } from "@/features/agents/lib/map-agent-row";
import type { AuthSession } from "@/features/auth/types";

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  return getAuthSession();
});

export const loginFn = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }): Promise<AuthSession> => {
    const email = data.email.trim().toLowerCase();
    const password = data.password;

    const supabase = createSupabaseServer();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session || !authData.user) {
      throwHttpError("Invalid email or password", 401);
    }

    const admin = createSupabaseAdmin();
    const { data: row, error: agentError } = await admin
      .from("agents")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (agentError || !row) {
      clearAuthCookies();
      throwHttpError("No agent profile found for this account.", 403);
    }

    const agent = mapAgentRow(row as AgentRow);
    if (!agent.isActive) {
      clearAuthCookies();
      throwHttpError("This agent account is inactive.", 403);
    }

    setAuthCookies(
      authData.session.access_token,
      authData.session.refresh_token,
      authData.session.expires_in,
    );

    return {
      userId: authData.user.id,
      email: authData.user.email ?? agent.email,
      agent,
    };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  clearAuthCookies();
});
