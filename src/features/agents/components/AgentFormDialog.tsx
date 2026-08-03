import { useEffect, useEffectEvent, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Globe2, Search, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createAgent, getAgentById, updateAgent } from "@/features/agents/api/agents.api";
import {
  assignableCustomerIds,
  canGrantAllCustomers,
  creatableRoles,
} from "@/features/agents/lib/agent-permissions";
import {
  formValuesToCustomerScope,
  getPasswordRequirementState,
  roleOptionLabels,
  validateAgentPasswords,
  type AgentFormValues,
} from "@/features/agents/validations/agent-form.schema";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Input,
  Select,
  usePasswordEndAction,
} from "@/features/incidents/components/incident-form-controls";
import { CUSTOMERS } from "@/data/mocks/customers.mock";
import { cn } from "@/lib/utils";
import { Avatar } from "@/shared/components/Avatar";
import type { Agent, AgentRole, ReportActor } from "@/shared/types/agent";

type FormSection = "info" | "access";

const FORM_SECTIONS: { id: FormSection; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "access", label: "Access" },
];

/** Top inset when jumping to a section (matches scroll pane `pt-5`). */
const SECTION_TOP_INSET = 20;

function emptyForm(defaults: {
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

function formFromAgent(agent: Agent, canAll: boolean): AgentFormValues {
  const scopeType =
    agent.customerScope.type === "all" && canAll ? "all" : "specific";
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

function PasswordRequirementPills({ password }: { password: string }) {
  const requirements = getPasswordRequirementState(password);
  return (
    <div className="flex flex-wrap gap-1.5">
      {requirements.map((req) => (
        <span
          key={req.id}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
            req.met
              ? "border-success/25 bg-success/10 text-success"
              : "border-border-color bg-app-bg text-text-muted",
          )}
        >
          <Check className="h-3 w-3" strokeWidth={2.5} />
          {req.label}
        </span>
      ))}
    </div>
  );
}

function ScopePill({
  selected,
  icon,
  title,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-left transition-colors",
        selected
          ? "border-brand-primary bg-brand-primary/5"
          : "border-border-color bg-card-bg hover:bg-app-bg",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-brand-primary bg-brand-primary"
            : "border-border-color bg-card-bg",
        )}
        aria-hidden
      >
        {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
      </span>
      <span
        className={cn(
          "text-text-secondary",
          selected && "text-brand-primary",
        )}
      >
        {icon}
      </span>
      <span className="text-[13px] font-semibold text-text-primary">{title}</span>
    </button>
  );
}

function SectionNav({
  activeSection,
  onSelect,
}: {
  activeSection: FormSection;
  onSelect: (section: FormSection) => void;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-border-color bg-app-bg/80 p-3 sm:w-[200px] sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r sm:p-4">
      {FORM_SECTIONS.map(({ id, label }) => {
        const active = activeSection === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-left text-[13px] font-semibold transition-colors",
              active
                ? "bg-brand-primary text-white"
                : "text-text-secondary hover:bg-app-bg hover:text-text-primary",
            )}
          >
            {label}
          </button>
        );
      })}
    </aside>
  );
}

function validateInfo(form: AgentFormValues, mode: "create" | "edit"): string | null {
  if (!form.name.trim()) return "Full name is required.";
  if (!form.email.trim() || !form.email.includes("@")) return "Enter a valid email address.";
  return validateAgentPasswords(form, mode);
}

export function AgentFormDialog({
  open,
  mode,
  agentId,
  actor,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  agentId?: string | null;
  actor: ReportActor;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const roles = useMemo(() => creatableRoles(actor), [actor]);
  const canAll = canGrantAllCustomers(actor);
  const allowedCustomerIds = useMemo(() => assignableCustomerIds(actor), [actor]);

  const defaultRole = roles[0] ?? "user";
  const defaultScopeType = canAll ? "all" : "specific";

  const [activeSection, setActiveSection] = useState<FormSection>("info");
  const [form, setForm] = useState<AgentFormValues>(() =>
    emptyForm({
      role: defaultRole,
      scopeType: defaultScopeType,
    }),
  );
  const [customerQuery, setCustomerQuery] = useState("");
  const [viewSelectedOnly, setViewSelectedOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLElement>(null);
  const accessRef = useRef<HTMLElement>(null);
  const scrollingToSectionRef = useRef(false);

  const isEditingSelf = mode === "edit" && agentId === actor.id;
  const showPasswordFields = mode === "create" || form.changePassword;
  const customersDisabled = form.scopeType !== "specific";
  const passwordEndAction = usePasswordEndAction(showPassword, () =>
    setShowPassword((current) => !current),
  );
  const confirmPasswordEndAction = usePasswordEndAction(showConfirmPassword, () =>
    setShowConfirmPassword((current) => !current),
  );

  const updateAccessMinHeight = useEffectEvent(() => {
    const root = scrollRef.current;
    const access = accessRef.current;
    if (!root || !access) return;
    // Fill the pane minus top + bottom insets (matches `py-5`).
    access.style.minHeight = `${Math.max(0, root.clientHeight - SECTION_TOP_INSET * 2)}px`;
  });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);
    setActiveSection("info");
    setCustomerQuery("");
    setViewSelectedOnly(false);
    setShowPassword(false);
    setShowConfirmPassword(false);

    async function hydrate() {
      if (mode === "edit" && agentId) {
        setHydrating(true);
        try {
          const agent = await getAgentById(agentId);
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
  }, [open, mode, agentId, canAll, defaultRole, defaultScopeType]);

  const assignableCustomers = useMemo(() => {
    const allowed = new Set(allowedCustomerIds);
    return CUSTOMERS.filter((c) => allowed.has(c.id)).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [allowedCustomerIds]);

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

  const scrollToSection = (section: FormSection) => {
    const root = scrollRef.current;
    const el = section === "info" ? infoRef.current : accessRef.current;
    if (!root || !el) return;

    updateAccessMinHeight();
    scrollingToSectionRef.current = true;
    setActiveSection(section);

    const top = Math.max(
      0,
      root.scrollTop +
        (el.getBoundingClientRect().top - root.getBoundingClientRect().top) -
        SECTION_TOP_INSET,
    );
    root.scrollTo({ top, behavior: "smooth" });
    window.setTimeout(() => {
      scrollingToSectionRef.current = false;
    }, 500);
  };

  const onScrollSync = useEffectEvent(() => {
    if (scrollingToSectionRef.current) return;
    const root = scrollRef.current;
    const accessEl = accessRef.current;
    if (!root || !accessEl) return;
    const rootTop = root.getBoundingClientRect().top;
    const accessTop = accessEl.getBoundingClientRect().top;
    setActiveSection(accessTop - rootTop <= 48 ? "access" : "info");
  });

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || hydrating) return;
    const handleScroll = () => onScrollSync();
    root.addEventListener("scroll", handleScroll, { passive: true });
    return () => root.removeEventListener("scroll", handleScroll);
  }, [hydrating, open]);

  useEffect(() => {
    if (!open || hydrating) return;
    const root = scrollRef.current;
    const access = accessRef.current;
    if (!root || !access) return;

    updateAccessMinHeight();

    const observer = new ResizeObserver(() => updateAccessMinHeight());
    observer.observe(root);
    return () => observer.disconnect();
  }, [open, hydrating]);

  const handleSubmit = async () => {
    setError(null);

    if (roles.length === 0) {
      setError("You do not have permission to manage agents.");
      return;
    }

    if (!roles.includes(form.role)) {
      setError("You cannot assign that role.");
      scrollToSection("info");
      return;
    }

    const infoError = validateInfo(form, mode);
    if (infoError) {
      setError(infoError);
      scrollToSection("info");
      return;
    }

    if (form.scopeType === "specific" && form.customerIds.length === 0) {
      setError("Select at least one customer, or choose All customers.");
      scrollToSection("access");
      return;
    }

    const customerScope = formValuesToCustomerScope(form);

    setLoading(true);
    try {
      if (mode === "create") {
        await createAgent(
          {
            name: form.name,
            email: form.email,
            role: form.role,
            isActive: form.isActive,
            customerScope,
            password: form.password,
          },
          actor,
        );
        toast.success("Agent created");
      } else if (agentId) {
        await updateAgent(
          agentId,
          {
            name: form.name,
            email: form.email,
            role: form.role,
            isActive: form.isActive,
            customerScope,
            password: form.changePassword ? form.password : undefined,
          },
          actor,
        );
        toast.success("Agent updated");
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(92vh,820px)] max-h-[min(92vh,820px)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-0 border-b border-border-color px-6 py-5 text-left">
          <DialogTitle className="text-[18px] font-bold tracking-tight text-text-primary">
            {mode === "create" ? "Add agent" : "Edit agent"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-text-secondary">
            {mode === "create"
              ? "Create a new agent and define their access."
              : "Update this agent’s details and access."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
          <SectionNav activeSection={activeSection} onSelect={scrollToSection} />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-5"
            >
              {hydrating ? (
                <p className="py-10 text-center text-[13px] text-text-muted">Loading agent…</p>
              ) : (
                <>
                  <section ref={infoRef} id="agent-form-info" className="scroll-mt-2 space-y-4">
                    <h3 className="text-[15px] font-bold text-text-primary">Info</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input
                        label="Full name"
                        value={form.name}
                        onChange={(v) => patch({ name: v })}
                      />
                      <Input
                        label="Email address"
                        type="email"
                        value={form.email}
                        onChange={(v) => patch({ email: v })}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Select
                        label="Role"
                        value={form.role}
                        onChange={(v) => patch({ role: v as AgentRole })}
                        disabled={isEditingSelf || roles.length === 0}
                        options={roles}
                        optionLabels={roleOptionLabels(roles)}
                      />
                      <Select
                        label="Status"
                        value={form.isActive ? "active" : "inactive"}
                        onChange={(v) => patch({ isActive: v === "active" })}
                        disabled={isEditingSelf}
                        options={["active", "inactive"]}
                        optionLabels={{ active: "Active", inactive: "Inactive" }}
                      />
                    </div>

                    <div className="space-y-3 border-t border-border-color pt-4">
                      {mode === "edit" && !form.changePassword ? (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="text-[11px] font-semibold text-brand-primary hover:underline"
                            onClick={() =>
                              patch({
                                changePassword: true,
                                password: "",
                                confirmPassword: "",
                              })
                            }
                          >
                            Change password
                          </button>
                        </div>
                      ) : null}

                      {showPasswordFields ? (
                        <>
                          {mode === "edit" ? (
                            <div className="flex justify-end">
                              <button
                                type="button"
                                className="text-[11px] font-semibold text-brand-primary hover:underline"
                                onClick={() =>
                                  patch({
                                    changePassword: false,
                                    password: "",
                                    confirmPassword: "",
                                  })
                                }
                              >
                                Cancel
                              </button>
                            </div>
                          ) : null}
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                              label={mode === "create" ? "Password" : "New password"}
                              type={showPassword ? "text" : "password"}
                              value={form.password}
                              onChange={(v) => patch({ password: v })}
                              endAction={passwordEndAction}
                              autoComplete="new-password"
                            />
                            <Input
                              label="Confirm password"
                              type={showConfirmPassword ? "text" : "password"}
                              value={form.confirmPassword}
                              onChange={(v) => patch({ confirmPassword: v })}
                              endAction={confirmPasswordEndAction}
                              autoComplete="new-password"
                            />
                          </div>
                          <PasswordRequirementPills password={form.password} />
                        </>
                      ) : null}
                    </div>
                  </section>

                  <section
                    ref={accessRef}
                    id="agent-form-access"
                    className="flex min-h-0 scroll-mt-2 flex-col gap-4"
                  >
                    <div className="shrink-0">
                      <h3 className="text-[15px] font-bold text-text-primary">Access</h3>
                      <p className="mt-1 text-[12px] text-text-secondary">
                        Choose which customers this agent can view and manage.
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex shrink-0 flex-col gap-2 sm:flex-row",
                        !canAll && "sm:flex-col",
                      )}
                    >
                      {canAll ? (
                        <ScopePill
                          selected={form.scopeType === "all"}
                          icon={<Globe2 className="h-4 w-4" strokeWidth={2} />}
                          title="All customers"
                          onClick={() => {
                            patch({ scopeType: "all", customerIds: [] });
                            setViewSelectedOnly(false);
                          }}
                        />
                      ) : null}
                      <ScopePill
                        selected={form.scopeType === "specific"}
                        icon={<User className="h-4 w-4" strokeWidth={2} />}
                        title="Specific customers"
                        onClick={() =>
                          patch({
                            scopeType: "specific",
                            customerIds:
                              form.scopeType === "specific" ? form.customerIds : [],
                          })
                        }
                      />
                    </div>

                    <div
                      className={cn(
                        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color transition-opacity",
                        customersDisabled && "opacity-50",
                      )}
                      aria-disabled={customersDisabled}
                    >
                      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border-color bg-app-bg px-3 py-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Search
                            className="h-3.5 w-3.5 shrink-0 text-text-muted"
                            strokeWidth={2}
                          />
                          <input
                            value={customerQuery}
                            onChange={(e) => setCustomerQuery(e.target.value)}
                            placeholder="Search customers…"
                            disabled={customersDisabled}
                            className="w-full min-w-0 bg-transparent text-[12px] text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
                          />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            disabled={customersDisabled}
                            className="text-[11px] font-semibold text-brand-primary hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
                            onClick={() =>
                              patch({
                                customerIds: assignableCustomers.map((c) => c.id),
                              })
                            }
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            disabled={customersDisabled}
                            className="text-[11px] font-semibold text-text-muted hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
                            onClick={() => {
                              patch({ customerIds: [] });
                              setViewSelectedOnly(false);
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-1.5">
                        {filteredCustomers.map((customer) => {
                          const checked =
                            !customersDisabled && form.customerIds.includes(customer.id);
                          return (
                            <button
                              key={customer.id}
                              type="button"
                              disabled={customersDisabled}
                              onClick={() => toggleCustomer(customer.id)}
                              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-app-bg disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                              <span
                                className={cn(
                                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                  checked
                                    ? "border-brand-primary bg-brand-primary text-white"
                                    : "border-border-color bg-card-bg",
                                )}
                                aria-hidden
                              >
                                {checked ? (
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                ) : null}
                              </span>
                              <Avatar
                                name={customer.name}
                                seed={customer.id}
                                src={customer.imageUrl}
                                size="md"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-semibold text-text-primary">
                                  {customer.name}
                                </span>
                                <span className="block truncate text-[11px] text-text-muted">
                                  {customer.email}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                        {filteredCustomers.length === 0 ? (
                          <p className="px-2 py-3 text-[12px] text-text-muted">
                            {viewSelectedOnly
                              ? "No selected customers match your search."
                              : "No customers found"}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border-color px-3 py-2">
                        <span className="text-[11px] font-medium text-text-secondary">
                          {customersDisabled
                            ? "Select Specific customers to choose"
                            : `${selectedCustomers.length} customer${
                                selectedCustomers.length === 1 ? "" : "s"
                              } selected`}
                        </span>
                        <button
                          type="button"
                          disabled={customersDisabled || selectedCustomers.length === 0}
                          onClick={() => setViewSelectedOnly((v) => !v)}
                          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-primary hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {viewSelectedOnly
                            ? "Show all"
                            : `View selected (${selectedCustomers.length})`}
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform",
                              viewSelectedOnly && "rotate-180",
                            )}
                            strokeWidth={2}
                          />
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                  {error}
                </p>
              ) : null}
            </div>

            <DialogFooter className="shrink-0 gap-2 border-t border-border-color px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="!h-9 !rounded-md !px-4"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                loading={loading}
                disabled={hydrating || roles.length === 0}
                className="!h-9 !rounded-md !px-4"
              >
                {mode === "create" ? (
                  <>
                    <UserPlus className="mr-1.5 h-4 w-4" strokeWidth={2} />
                    Create agent
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
