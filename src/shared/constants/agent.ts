import type { AgentProfile, Priority } from "@/shared/types";

export const CURRENT_AGENT: AgentProfile = {
  id: "agent-priya",
  name: "Priya Ramanathan",
  handle: "@priya",
  initials: "PR",
  role: "Senior Support Agent",
  shift: "EU · 14:00–22:00",
};

export const AGENTS: AgentProfile[] = [
  CURRENT_AGENT,
  {
    id: "agent-chandan",
    name: "Chandan Shaw",
    handle: "@chandan",
    initials: "CS",
    role: "Support Agent",
    shift: "IN · 09:00–18:00",
  },
  {
    id: "agent-james",
    name: "James Okonkwo",
    handle: "@james",
    initials: "JO",
    role: "Support Agent",
    shift: "EU · 08:00–16:00",
  },
  {
    id: "agent-sara",
    name: "Sara Chen",
    handle: "@sara",
    initials: "SC",
    role: "Support Agent",
    shift: "US · 16:00–00:00",
  },
];

export const priorityMeta: Record<Priority, { label: string; tone: string; dot: string }> = {
  P1: { label: "P1 · Critical", tone: "bg-destructive/15 text-destructive border-destructive/30", dot: "bg-destructive" },
  P2: { label: "P2 · High", tone: "bg-warning/10 text-warning border-warning/30", dot: "bg-warning" },
  P3: { label: "P3 · Medium", tone: "bg-info/10 text-info border-info/30", dot: "bg-info" },
  P4: { label: "P4 · Low", tone: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
};
