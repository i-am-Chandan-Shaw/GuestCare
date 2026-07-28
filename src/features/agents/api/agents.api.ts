import { AGENTS } from "@/shared/constants/agent";
import type { AgentProfile } from "@/shared/types";

export async function getAgents(): Promise<AgentProfile[]> {
  return AGENTS;
}
