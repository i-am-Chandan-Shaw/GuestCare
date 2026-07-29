import { getSessionFn, loginFn, logoutFn } from "@/features/auth/auth.functions";
import type { LoginInput } from "@/features/auth/lib/login-schema";
import type { AuthSession } from "@/features/auth/types";

let cachedSession: { value: AuthSession | null; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

function isCacheValid(): boolean {
  if (!cachedSession) return false;
  if (typeof window === "undefined") return false;
  return Date.now() - cachedSession.ts < CACHE_TTL_MS;
}

/** Client auth entry point. Swap this file when wiring a real API. */
export async function getSession(): Promise<AuthSession | null> {
  if (isCacheValid()) return cachedSession!.value;
  const session = await getSessionFn();
  if (typeof window !== "undefined") {
    cachedSession = { value: session, ts: Date.now() };
  }
  return session;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const session = await loginFn({ data: input });
  cachedSession = { value: session, ts: Date.now() };
  return session;
}

export async function logout(): Promise<void> {
  await logoutFn();
  cachedSession = null;
}

export type { LoginInput };
