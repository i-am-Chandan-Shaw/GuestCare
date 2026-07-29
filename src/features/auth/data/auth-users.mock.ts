import { AGENTS } from "@/shared/constants/agent";

const DEV_PASSWORD = process.env.AUTH_DEV_PASSWORD ?? "guestcare";

export function findMockAuthUser(email: string, password: string) {
  if (password !== DEV_PASSWORD) return null;

  const normalized = email.trim().toLowerCase();
  const agent = AGENTS.find(
    (entry) => `${entry.handle.replace("@", "")}@guestcare.io` === normalized,
  );
  if (!agent) return null;

  return { email: normalized, agent };
}
