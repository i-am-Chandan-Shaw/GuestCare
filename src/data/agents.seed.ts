import type { Agent } from "@/shared/types/agent";
import { nowIso } from "@/shared/lib/datetime";

const SEED_NOW = nowIso();

export const AGENT_SEED: Agent[] = [
  {
    id: "agent-priya",
    name: "Priya Ramanathan",
    email: "priya@guestcare.com",
    role: "manager",
    isActive: true,
    customerScope: { type: "all" },
    createdAt: SEED_NOW,
    updatedAt: SEED_NOW,
  },
  {
    id: "agent-chandan",
    name: "Chandan Shaw",
    email: "chandan@guestcare.com",
    role: "admin",
    isActive: true,
    customerScope: { type: "all" },
    createdAt: SEED_NOW,
    updatedAt: SEED_NOW,
  },
  {
    id: "agent-james",
    name: "James Okonkwo",
    email: "james@guestcare.com",
    role: "user",
    isActive: true,
    customerScope: { type: "specific", customerIds: ["c1", "c2"] },
    createdAt: SEED_NOW,
    updatedAt: SEED_NOW,
  },
  {
    id: "agent-sara",
    name: "Sara Chen",
    email: "sara@guestcare.com",
    role: "user",
    isActive: true,
    customerScope: { type: "specific", customerIds: ["c3", "c4"] },
    createdAt: SEED_NOW,
    updatedAt: SEED_NOW,
  },
];

/** Dev-only plaintext passwords keyed by agent id (server auth mock) */
export const AGENT_DEV_PASSWORDS: Record<string, string> = {
  "agent-chandan": process.env.AUTH_DEV_PASSWORD ?? "admin",
  "agent-priya": "priya123",
  "agent-james": "james123",
  "agent-sara": "sara123",
};

export const DEFAULT_AGENT_ID = "agent-priya";

export function findAgentById(id: string): Agent | undefined {
  return AGENT_SEED.find((a) => a.id === id);
}

export function findAgentByEmail(email: string): Agent | undefined {
  const normalized = email.trim().toLowerCase();
  return AGENT_SEED.find((a) => a.email.toLowerCase() === normalized);
}

export function findAgentByName(name: string): Agent | undefined {
  return AGENT_SEED.find((a) => a.name === name);
}
