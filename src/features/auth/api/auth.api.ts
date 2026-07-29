import { getSessionFn, loginFn, logoutFn } from "@/features/auth/auth.functions";
import type { LoginInput } from "@/features/auth/lib/login-schema";
import type { AuthSession } from "@/features/auth/types";

/** Client auth entry point. Swap this file when wiring a real API. */
export async function getSession(): Promise<AuthSession | null> {
  return getSessionFn();
}

export async function login(input: LoginInput): Promise<AuthSession> {
  return loginFn({ data: input });
}

export async function logout(): Promise<void> {
  await logoutFn();
}

export type { LoginInput };
