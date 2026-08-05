import { getSessionFn, loginFn, logoutFn } from "@/features/auth/auth.functions";
import type { LoginInput } from "@/features/auth/lib/login-schema";
import type { AuthSession } from "@/features/auth/types";

// Holds the loaded session identity on the client.
// Not a TTL cache — just prevents re-fetching the same logged-in
// user on every navigation click. login() replaces it, logout() clears it.
let _loadedSession: AuthSession | null | undefined;

export async function getSession(): Promise<AuthSession | null> {
  if (typeof window !== "undefined" && _loadedSession !== undefined) {
    return _loadedSession;
  }
  const session = await getSessionFn();
  if (typeof window !== "undefined") {
    _loadedSession = session;
  }
  return session;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const session = await loginFn({ data: input });
  _loadedSession = session;
  return session;
}

export async function logout(): Promise<void> {
  await logoutFn();
  _loadedSession = undefined;
}

export type { LoginInput };
