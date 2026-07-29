import type { Agent } from "@/shared/types/agent";

export interface AuthSession {
  userId: string;
  email: string;
  agent: Agent;
}
