import { findAgentByEmail, getAgentPasswordHash } from "@/features/agents/lib/agent-store";
import { verifyPassword } from "@/features/auth/lib/password";
import type { Agent } from "@/shared/types/agent";

export async function findMockAuthUser(
  email: string,
  password: string,
): Promise<{ email: string; agent: Agent } | null> {
  const agent = findAgentByEmail(email);
  if (!agent || !agent.isActive) return null;

  const expectedHash = getAgentPasswordHash(agent.id);
  if (!expectedHash || !(await verifyPassword(password, expectedHash))) return null;

  return { email: agent.email, agent };
}
