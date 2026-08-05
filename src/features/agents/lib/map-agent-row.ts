import type { Agent, AgentCustomerScope, AgentRole } from "@/shared/types/agent";

export type AgentRow = {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
  is_active: boolean;
  customer_scope: AgentCustomerScope;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export function mapAgentRow(row: AgentRow): Agent {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: row.is_active,
    customerScope: row.customer_scope,
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
