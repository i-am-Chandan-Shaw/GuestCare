import { useRouteContext } from "@tanstack/react-router";
import type { AuthSession } from "@/features/auth/types";

export function useAuth(): AuthSession {
  const { auth } = useRouteContext({ from: "__root__" });
  if (!auth) {
    throw new Error("useAuth requires an authenticated session.");
  }
  return auth;
}
