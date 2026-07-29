import { redirect } from "@tanstack/react-router";
import type { AuthSession } from "@/features/auth/types";

export function safeRedirectPath(path?: string): string {
  if (!path?.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export function requireAuth(auth: AuthSession | null, returnTo: string) {
  if (!auth) {
    throw redirect({
      to: "/login",
      search: { redirect: returnTo },
    });
  }
}
