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

/**
 * Dev-only password digests (SHA-256 of `${AUTH_SECRET}:${password}`).
 * Generated with AUTH_SECRET from .env.example. Demo passwords:
 * chandan@… → admin, priya@… → priya123, james@… → james123, sara@… → sara123
 */
export const AGENT_DEV_PASSWORD_HASHES: Record<string, string> = {
  "agent-chandan": "7029ba13458aec6c15e71081063230c32eedebb8b151e568b47eb4af86b15760",
  "agent-priya": "d988d2672ef0ca52f7fc88e65cd5b97f1b336d9e2b9193327b6ffe8d3424ed26",
  "agent-james": "518b0811c22c2f9fa9d790ab53f2d487dfcd6e81a6193a11df7a1477c570175f",
  "agent-sara": "a0ea0a2b5366fc56ef3187466d384cde2faf93221db48a76cf83e08f48607bfd",
};

export const DEFAULT_AGENT_ID = "agent-priya";
