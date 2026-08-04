/** ISO 8601 UTC string, e.g. "2026-07-29T10:42:00.000Z" */
export type IsoDateTime = string;

export type AgentRole = "admin" | "manager" | "user";

export type AgentCustomerScope = { type: "all" } | { type: "specific"; customerIds: string[] };

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
  isActive: boolean;
  customerScope: AgentCustomerScope;
  /** Profile image URL when available; UI falls back to initials. */
  imageUrl?: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface AgentListItem {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
  isActive: boolean;
  /** Full scope for edit forms; label is for table display. */
  customerScope: AgentCustomerScope;
  customerScopeLabel: string;
  /** Profile image URL when available; UI falls back to initials. */
  imageUrl?: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface CreateAgentInput {
  name: string;
  email: string;
  role: AgentRole;
  isActive?: boolean;
  customerScope: AgentCustomerScope;
  password: string;
}

export interface UpdateAgentInput {
  name: string;
  email: string;
  role: AgentRole;
  isActive: boolean;
  customerScope: AgentCustomerScope;
  password?: string;
}

export interface AgentsQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedAgents {
  data: AgentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Server/auth only — never expose to client */
export interface AgentCredentials {
  agentId: string;
  passwordHash: string;
}

export type ReportActor = Pick<Agent, "id" | "name" | "role" | "customerScope">;
