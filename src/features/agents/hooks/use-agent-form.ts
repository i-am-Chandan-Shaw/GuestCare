import { useState, useMemo, useEffect } from "react";
import { assignableCustomerIds } from "@/features/agents/lib/agent-permissions";
import type { AgentFormValues } from "@/features/agents/validations/agent-form.schema";
import type { Agent, AgentListItem, AgentAccess } from "@/shared/types/agent";
import { CUSTOMERS } from "@/mock-data/mocks/customers.mock";

type AgentFormSource = Pick<
  Agent,
  "name" | "email" | "role" | "isActive" | "customerScope"
>;

export function emptyForm(defaults: {
  role: AgentFormValues["role"];
  scopeType: AgentFormValues["scopeType"];
}): AgentFormValues {
  return {
    name: "",
    email: "",
    role: defaults.role,
    isActive: true,
    scopeType: defaults.scopeType,
    customerIds: [],
    password: "",
    confirmPassword: "",
    changePassword: false,
  };
}

export function formFromAgent(agent: AgentFormSource, canAll: boolean): AgentFormValues {
  const scopeType = agent.customerScope.type === "all" && canAll ? "all" : "specific";
  return {
    name: agent.name,
    email: agent.email,
    role: agent.role,
    isActive: agent.isActive,
    scopeType,
    customerIds:
      agent.customerScope.type === "specific" ? [...agent.customerScope.customerIds] : [],
    password: "",
    confirmPassword: "",
    changePassword: false,
  };
}

export function useAgentFormState({
  open,
  mode,
  agent,
  currentAgent,
  canAll,
  defaultRole,
  defaultScopeType,
}: {
  open: boolean;
  mode: "create" | "edit";
  agent?: AgentListItem | null;
  currentAgent: AgentAccess;
  canAll: boolean;
  defaultRole: AgentFormValues["role"];
  defaultScopeType: AgentFormValues["scopeType"];
}) {
  const [form, setForm] = useState<AgentFormValues>(() =>
    emptyForm({
      role: defaultRole,
      scopeType: defaultScopeType,
    }),
  );
  const [customerQuery, setCustomerQuery] = useState("");
  const [viewSelectedOnly, setViewSelectedOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setCustomerQuery("");
    setViewSelectedOnly(false);

    if (mode === "edit") {
      if (!agent) {
        setError("Agent not found.");
        return;
      }
      setForm(formFromAgent(agent, canAll));
      return;
    }

    setForm(
      emptyForm({
        role: defaultRole,
        scopeType: defaultScopeType,
      }),
    );
  }, [open, mode, agent, canAll, defaultRole, defaultScopeType]);

  const patch = (partial: Partial<AgentFormValues>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const toggleCustomer = (id: string) => {
    setForm((prev) => ({
      ...prev,
      customerIds: prev.customerIds.includes(id)
        ? prev.customerIds.filter((item) => item !== id)
        : [...prev.customerIds, id],
    }));
  };

  const assignableCustomers = useMemo(() => {
    const allowed = new Set(assignableCustomerIds(currentAgent));
    return CUSTOMERS.filter((c) => allowed.has(c.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [currentAgent]);

  const selectedCustomers = useMemo(() => {
    const selected = new Set(form.customerIds);
    return assignableCustomers.filter((c) => selected.has(c.id));
  }, [assignableCustomers, form.customerIds]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    const list = viewSelectedOnly ? selectedCustomers : assignableCustomers;
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }, [assignableCustomers, customerQuery, selectedCustomers, viewSelectedOnly]);

  return {
    form,
    patch,
    customerQuery,
    setCustomerQuery,
    viewSelectedOnly,
    setViewSelectedOnly,
    hydrating: false,
    error,
    setError,
    assignableCustomers,
    selectedCustomers,
    filteredCustomers,
    toggleCustomer,
  };
}
