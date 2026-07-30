import { findAgentByEmail, getAgentPassword } from "@/features/agents/lib/agent-store";
import type { Agent } from "@/shared/types/agent";

export function findMockAuthUser(
  email: string,
  password: string,
): { email: string; agent: Agent } | null {
  const agent = findAgentByEmail(email);
  if (!agent || !agent.isActive) return null;

  const expectedPassword = getAgentPassword(agent.id);
  if (!expectedPassword || password !== expectedPassword) return null;

  return { email: agent.email, agent };
}
