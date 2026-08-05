import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { mapAgentRow, type AgentRow } from "@/features/agents/lib/map-agent-row";
import { createSupabaseAdmin } from "@/shared/lib/supabase/admin";
import { createSupabaseServer } from "@/shared/lib/supabase/server";
import type { AuthSession } from "@/features/auth/types";

const ACCESS_COOKIE = "gc_access_token";
const REFRESH_COOKIE = "gc_refresh_token";
const DEFAULT_MAX_AGE_SECONDS = 60 * 60;

function secureCookie() {
  return process.env.NODE_ENV === "production";
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: secureCookie(),
    maxAge,
  };
}

export function readAccessToken(): string | null {
  return getCookie(ACCESS_COOKIE) ?? null;
}

export function readRefreshToken(): string | null {
  return getCookie(REFRESH_COOKIE) ?? null;
}

export function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  expiresIn = DEFAULT_MAX_AGE_SECONDS,
) {
  const accessMaxAge = Math.max(60, expiresIn);
  // Refresh tokens last longer; keep ~30 days as a practical default.
  const refreshMaxAge = Math.max(accessMaxAge, 60 * 60 * 24 * 30);

  setCookie(ACCESS_COOKIE, accessToken, cookieOptions(accessMaxAge));
  setCookie(REFRESH_COOKIE, refreshToken, cookieOptions(refreshMaxAge));
}

export function clearAuthCookies() {
  const options = { path: "/", httpOnly: true, sameSite: "lax" as const, secure: secureCookie() };
  deleteCookie(ACCESS_COOKIE, options);
  deleteCookie(REFRESH_COOKIE, options);
}

async function loadAgentSession(userId: string, email: string): Promise<AuthSession | null> {
  const admin = createSupabaseAdmin();
  const { data, error } = await admin.from("agents").select("*").eq("id", userId).maybeSingle();

  if (error || !data) return null;

  const agent = mapAgentRow(data as AgentRow);
  if (!agent.isActive) return null;

  return {
    userId,
    email: email || agent.email,
    agent,
  };
}

async function sessionFromAccessToken(accessToken: string): Promise<AuthSession | null> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return loadAgentSession(data.user.id, data.user.email ?? "");
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const accessToken = readAccessToken();
  if (accessToken) {
    const session = await sessionFromAccessToken(accessToken);
    if (session) return session;
  }

  const refreshToken = readRefreshToken();
  if (!refreshToken) return null;

  const supabase = createSupabaseServer();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session || !data.user) {
    clearAuthCookies();
    return null;
  }

  setAuthCookies(
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in ?? DEFAULT_MAX_AGE_SECONDS,
  );

  return loadAgentSession(data.user.id, data.user.email ?? "");
}
