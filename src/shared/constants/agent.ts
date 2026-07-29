import { AGENT_SEED, DEFAULT_AGENT_ID } from "@/data/agents.seed";
import {
  formatAgentRole,
  getAgentHandle,
  getAgentInitials,
} from "@/shared/lib/agent-display";
import type { AgentProfile, Priority } from "@/shared/types";

function toAgentProfile(agent: (typeof AGENT_SEED)[number]): AgentProfile {
  return {
    id: agent.id,
    name: agent.name,
    handle: getAgentHandle(agent),
    initials: getAgentInitials(agent),
    role: formatAgentRole(agent.role),
    shift: "—",
  };
}

export const CURRENT_AGENT: AgentProfile = toAgentProfile(
  AGENT_SEED.find((a) => a.id === DEFAULT_AGENT_ID) ?? AGENT_SEED[0]!,
);

export const AGENTS: AgentProfile[] = AGENT_SEED.map(toAgentProfile);

export const priorityMeta: Record<Priority, { label: string; tone: string; dot: string }> = {
  P1: { label: "P1 · Critical", tone: "bg-destructive/15 text-destructive border-destructive/30", dot: "bg-destructive" },
  P2: { label: "P2 · High", tone: "bg-warning/10 text-warning border-warning/30", dot: "bg-warning" },
  P3: { label: "P3 · Medium", tone: "bg-info/10 text-info border-info/30", dot: "bg-info" },
  P4: { label: "P4 · Low", tone: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
};
