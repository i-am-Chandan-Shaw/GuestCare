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

export const DEFAULT_AGENT_ID = "agent-priya";
