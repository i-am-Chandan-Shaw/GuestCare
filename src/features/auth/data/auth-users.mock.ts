import { AGENTS } from "@/shared/constants/agent";

const MOCK_EMAIL = "chandan@guestcare.com";
const MOCK_PASSWORD = process.env.AUTH_DEV_PASSWORD ?? "admin";
const MOCK_AGENT = AGENTS.find((agent) => agent.id === "agent-chandan");

export function findMockAuthUser(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (normalized !== MOCK_EMAIL || password !== MOCK_PASSWORD || !MOCK_AGENT) {
    return null;
  }

  return { email: MOCK_EMAIL, agent: MOCK_AGENT };
}
