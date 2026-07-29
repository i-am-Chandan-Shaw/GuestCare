import type { AgentProfile } from "@/shared/types";

export interface AuthSession {
  userId: string;
  email: string;
  agent: AgentProfile;
}
