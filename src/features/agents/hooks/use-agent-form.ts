import { useState, useMemo, useEffect } from "react";
import { getAgentById } from "@/features/agents/api/agents.api";
import { assignableCustomerIds } from "@/features/agents/lib/agent-permissions";
import type { AgentFormValues } from "@/features/agents/validations/agent-form.schema";
import type { Agent, ReportActor } from "@/shared/types/agent";
import { CUSTOMERS } from "@/mock-data/mocks/customers.mock";

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

export function formFromAgent(agent: Agent, canAll: boolean): AgentFormValues {
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
  agentId,
  actor,
  canAll,
  defaultRole,
  defaultScopeType,
}: {
  open: boolean;
  mode: "create" | "edit";
  agentId?: string | null;
  actor: ReportActor;
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
  const [hydrating, setHydrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);
    setCustomerQuery("");
    setViewSelectedOnly(false);

    async function hydrate() {
      if (mode === "edit" && agentId) {
        setHydrating(true);
        try {
          const agent = await getAgentById(agentId, actor);
          if (cancelled) return;
          if (!agent) {
            setError("Agent not found.");
            return;
          }
          setForm(formFromAgent(agent, canAll));
        } catch (e) {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : "Failed to load agent.");
          }
        } finally {
          if (!cancelled) setHydrating(false);
        }
        return;
      }

      setForm(
        emptyForm({
          role: defaultRole,
          scopeType: defaultScopeType,
        }),
      );
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [open, mode, agentId, canAll, defaultRole, defaultScopeType, actor]);

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
    const allowed = new Set(assignableCustomerIds(actor));
    return CUSTOMERS.filter((c) => allowed.has(c.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [actor]);

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
    hydrating,
    error,
    setError,
    assignableCustomers,
    selectedCustomers,
    filteredCustomers,
    toggleCustomer,
  };
}
