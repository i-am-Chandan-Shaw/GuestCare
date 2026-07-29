import { createServerFn } from "@tanstack/react-start";
import { findMockAuthUser } from "@/features/auth/data/auth-users.mock";
import { loginSchema } from "@/features/auth/lib/login-schema";
import {
  clearSessionCookie,
  createSessionToken,
  parseSessionToken,
  readSessionCookie,
  setSessionCookie,
} from "@/features/auth/server/session";
import type { AuthSession } from "@/features/auth/types";

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const token = readSessionCookie();
  if (!token) return null;
  return parseSessionToken(token);
});

export const loginFn = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }): Promise<AuthSession> => {
    const user = findMockAuthUser(data.email, data.password);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const session: AuthSession = {
      userId: user.agent.id,
      email: user.email,
      agent: user.agent,
    };

    setSessionCookie(await createSessionToken(session));
    return session;
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  clearSessionCookie();
});
