import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  Mail,
  Search,
  Shield,
  User,
  UserPlus,
} from "lucide-react";
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
  ROLE_HELPER_COPY,
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
import { CUSTOMERS } from "@/data/mocks/customers.mock";
import { cn } from "@/lib/utils";
import type { Customer } from "@/shared/types";
import type { Agent, AgentRole, ReportActor } from "@/shared/types/agent";

type WizardStep = 1 | 2;

const AVATAR_TONES = [
  "bg-teal-600 text-white",
  "bg-rose-500 text-white",
  "bg-amber-500 text-white",
  "bg-indigo-500 text-white",
  "bg-sky-600 text-white",
  "bg-violet-500 text-white",
  "bg-emerald-600 text-white",
] as const;

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

function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

function avatarToneForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length;
  }
  return AVATAR_TONES[hash] ?? AVATAR_TONES[0]!;
}

function CustomerAvatar({
  customer,
  size = "md",
  className,
}: {
  customer: Pick<Customer, "id" | "name">;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        size === "sm" ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-[11px]",
        avatarToneForId(customer.id),
        className,
      )}
      aria-hidden
    >
      {customerInitials(customer.name)}
    </span>
  );
}

function IconField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[12px] font-semibold text-text-primary">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {icon}
        </span>
        {children}
      </div>
    </label>
  );
}

const fieldClassName =
  "h-11 w-full rounded-md border border-border-color bg-card-bg pl-10 pr-3 text-[13px] text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand-primary/40";

function ScopeChoiceCard({
  selected,
  icon,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full flex-col items-start gap-2 rounded-md border p-3.5 text-left transition-colors",
        selected
          ? "border-2 border-brand-primary bg-brand-primary/5 shadow-sm"
          : "border border-border-color bg-card-bg hover:bg-app-bg",
      )}
    >
      <span
        className={cn(
          "absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full border",
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
          "flex h-8 w-8 items-center justify-center rounded-md",
          selected ? "bg-brand-primary/15 text-brand-primary" : "bg-app-bg text-text-secondary",
        )}
      >
        {icon}
      </span>
      <span className="text-[13px] font-semibold text-text-primary">{title}</span>
      <span className="pr-4 text-[11px] leading-snug text-text-secondary">{description}</span>
    </button>
  );
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

function StepRail({ step }: { step: WizardStep }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border-color bg-app-bg/80 p-5 sm:w-[240px] sm:border-b-0 sm:border-r">
      <ol className="relative space-y-0">
        <li className="relative flex gap-3 pb-8">
          <div className="relative flex flex-col items-center">
            <span
              className={cn(
                "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold",
                step === 1
                  ? "bg-brand-primary text-white"
                  : "bg-success text-white",
              )}
            >
              {step > 1 ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : "1"}
            </span>
            <span
              className="absolute top-7 bottom-[-2rem] left-1/2 w-px -translate-x-1/2 border-l border-dashed border-border-color"
              aria-hidden
            />
          </div>
          <div className="min-w-0 pt-0.5">
            <p
              className={cn(
                "text-[13px] font-semibold",
                step === 1 ? "text-text-primary" : "text-text-secondary",
              )}
            >
              Agent details
            </p>
            <p className="text-[11px] leading-snug text-text-muted">
              Basic information, role and status
            </p>
          </div>
        </li>
        <li className="relative flex gap-3">
          <div className="relative flex flex-col items-center">
            <span
              className={cn(
                "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold",
                step === 2
                  ? "bg-brand-primary text-white"
                  : "border border-border-color bg-card-bg text-text-muted",
              )}
            >
              2
            </span>
          </div>
          <div className="min-w-0 pt-0.5">
            <p
              className={cn(
                "text-[13px] font-semibold",
                step === 2 ? "text-text-primary" : "text-text-muted",
              )}
            >
              Customer access
            </p>
            <p className="text-[11px] leading-snug text-text-muted">
              Choose which customers this agent can access
            </p>
          </div>
        </li>
      </ol>

      <div className="mt-auto hidden rounded-md border border-border-color bg-card-bg p-3 sm:block">
        <div className="flex items-start gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary">
            <Shield className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-[12px] font-semibold text-text-primary">What can this agent see?</p>
            <p className="text-[11px] leading-snug text-text-secondary">
              Agents can view and manage customers and their related issues based on the access
              permissions.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function validateStep1(form: AgentFormValues, mode: "create" | "edit"): string | null {
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

  const [step, setStep] = useState<WizardStep>(1);
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

  const isEditingSelf = mode === "edit" && agentId === actor.id;
  const showPasswordFields = mode === "create" || form.changePassword;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);
    setStep(1);
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

  const footerAvatars = selectedCustomers.slice(0, 5);
  const footerOverflow = Math.max(0, selectedCustomers.length - footerAvatars.length);

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

  const handleContinue = () => {
    setError(null);
    if (roles.length === 0) {
      setError("You do not have permission to manage agents.");
      return;
    }
    if (!roles.includes(form.role)) {
      setError("You cannot assign that role.");
      return;
    }
    const stepError = validateStep1(form, mode);
    if (stepError) {
      setError(stepError);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(null);

    if (roles.length === 0) {
      setError("You do not have permission to manage agents.");
      return;
    }

    if (!roles.includes(form.role)) {
      setError("You cannot assign that role.");
      return;
    }

    const passwordError = validateAgentPasswords(form, mode);
    if (passwordError) {
      setError(passwordError);
      setStep(1);
      return;
    }

    if (form.scopeType === "specific" && form.customerIds.length === 0) {
      setError("Select at least one customer, or choose All customers.");
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
      <DialogContent className="flex max-h-[min(92vh,820px)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-0 border-b border-border-color px-6 py-5 text-left">
          <DialogTitle className="text-[18px] font-bold tracking-tight text-text-primary">
            {mode === "create" ? "Add agent" : "Edit agent"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-text-secondary">
            Create a new agent and define their access.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
          <StepRail step={step} />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {hydrating ? (
                <p className="py-10 text-center text-[13px] text-text-muted">Loading agent…</p>
              ) : step === 1 ? (
                <>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                      Step 1 of 2
                    </p>
                    <h3 className="mt-1 text-[18px] font-bold text-text-primary">Agent details</h3>
                    <p className="mt-1 text-[13px] text-text-secondary">
                      Add the basic information for this agent.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <IconField
                      label="Full name"
                      icon={<User className="h-4 w-4" strokeWidth={2} />}
                    >
                      <input
                        value={form.name}
                        onChange={(e) => patch({ name: e.target.value })}
                        placeholder="Enter full name"
                        className={fieldClassName}
                      />
                    </IconField>
                    <IconField
                      label="Email address"
                      icon={<Mail className="h-4 w-4" strokeWidth={2} />}
                    >
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => patch({ email: e.target.value })}
                        placeholder="name@guestcare.com"
                        className={fieldClassName}
                      />
                    </IconField>
                  </div>

                  <label className="block space-y-1.5">
                    <span className="text-[12px] font-semibold text-text-primary">Role</span>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-violet-600">
                        <Shield className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <select
                        value={form.role}
                        onChange={(e) => patch({ role: e.target.value as AgentRole })}
                        disabled={isEditingSelf || roles.length === 0}
                        className={cn(
                          fieldClassName,
                          "appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%23666%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] pr-9 font-medium disabled:cursor-not-allowed disabled:opacity-60",
                        )}
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {roleOptionLabels(roles)[role]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-[11px] leading-snug text-text-muted">
                      {ROLE_HELPER_COPY[form.role]}
                    </p>
                  </label>

                  <div className="flex items-center justify-between gap-4 rounded-md border border-border-color px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary">
                        Is agent active?
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        Active agents can log in and access the platform.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.isActive}
                      disabled={isEditingSelf}
                      onClick={() => patch({ isActive: !form.isActive })}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        form.isActive ? "bg-brand-primary" : "bg-border-color",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                          form.isActive && "translate-x-5",
                        )}
                      />
                    </button>
                  </div>

                  <section className="space-y-3 rounded-md border border-border-color p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-app-bg text-text-secondary">
                          <Lock className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-semibold text-text-primary">
                            Login details
                          </h4>
                          <p className="text-[11px] text-text-secondary">
                            Set a secure password for the agent to access the platform.
                          </p>
                        </div>
                      </div>
                      {mode === "edit" ? (
                        <button
                          type="button"
                          className="shrink-0 text-[11px] font-semibold text-brand-primary hover:underline"
                          onClick={() =>
                            patch({
                              changePassword: !form.changePassword,
                              password: "",
                              confirmPassword: "",
                            })
                          }
                        >
                          {form.changePassword ? "Cancel" : "Change password"}
                        </button>
                      ) : null}
                    </div>

                    {showPasswordFields ? (
                      <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <IconField
                            label={mode === "create" ? "Password" : "New password"}
                            icon={<Lock className="h-4 w-4" strokeWidth={2} />}
                          >
                            <input
                              type={showPassword ? "text" : "password"}
                              value={form.password}
                              onChange={(e) => patch({ password: e.target.value })}
                              placeholder="At least 8 characters"
                              className={cn(fieldClassName, "pr-10")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" strokeWidth={2} />
                              ) : (
                                <Eye className="h-4 w-4" strokeWidth={2} />
                              )}
                            </button>
                          </IconField>
                          <IconField
                            label="Confirm password"
                            icon={<Lock className="h-4 w-4" strokeWidth={2} />}
                          >
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={form.confirmPassword}
                              onChange={(e) => patch({ confirmPassword: e.target.value })}
                              placeholder="Repeat password"
                              className={cn(fieldClassName, "pr-10")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                              aria-label={
                                showConfirmPassword
                                  ? "Hide confirm password"
                                  : "Show confirm password"
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" strokeWidth={2} />
                              ) : (
                                <Eye className="h-4 w-4" strokeWidth={2} />
                              )}
                            </button>
                          </IconField>
                        </div>
                        <PasswordRequirementPills password={form.password} />
                      </>
                    ) : (
                      <p className="text-[12px] text-text-secondary">
                        Leave unchanged unless you need to reset this agent’s login password.
                      </p>
                    )}
                  </section>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                      Step 2 of 2
                    </p>
                    <h3 className="mt-1 text-[18px] font-bold text-text-primary">
                      Customer access
                    </h3>
                    <p className="mt-1 text-[13px] text-text-secondary">
                      Choose which customers this agent can view and manage.
                    </p>
                  </div>

                  <div
                    className={cn(
                      "grid gap-3",
                      canAll ? "sm:grid-cols-2" : "grid-cols-1",
                    )}
                  >
                    {canAll ? (
                      <ScopeChoiceCard
                        selected={form.scopeType === "all"}
                        icon={<Globe2 className="h-4 w-4" strokeWidth={2} />}
                        title="All customers"
                        description="Agent can access every customer and their issues"
                        onClick={() => {
                          patch({ scopeType: "all", customerIds: [] });
                          setViewSelectedOnly(false);
                        }}
                      />
                    ) : null}
                    <ScopeChoiceCard
                      selected={form.scopeType === "specific"}
                      icon={<User className="h-4 w-4" strokeWidth={2} />}
                      title="Specific customers"
                      description="Choose specific customers to grant access"
                      onClick={() =>
                        patch({
                          scopeType: "specific",
                          customerIds:
                            form.scopeType === "specific" ? form.customerIds : [],
                        })
                      }
                    />
                  </div>

                  {form.scopeType === "all" ? (
                    <div className="flex items-start gap-2 rounded-md border border-success/25 bg-success/10 px-3 py-2.5 text-[12px] text-success">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
                      <p>
                        This agent will be able to view and manage all customers and related
                        issues.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-md border border-border-color">
                      <div className="flex flex-wrap items-center gap-2 border-b border-border-color bg-app-bg px-3 py-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Search
                            className="h-3.5 w-3.5 shrink-0 text-text-muted"
                            strokeWidth={2}
                          />
                          <input
                            value={customerQuery}
                            onChange={(e) => setCustomerQuery(e.target.value)}
                            placeholder="Search customers…"
                            className="w-full min-w-0 bg-transparent text-[12px] text-text-primary outline-none placeholder:text-text-muted"
                          />
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            className="text-[11px] font-semibold text-brand-primary hover:underline"
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
                            className="text-[11px] font-semibold text-text-muted hover:underline"
                            onClick={() => {
                              patch({ customerIds: [] });
                              setViewSelectedOnly(false);
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="max-h-48 space-y-0.5 overflow-y-auto p-1.5">
                        {filteredCustomers.map((customer) => {
                          const checked = form.customerIds.includes(customer.id);
                          return (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => toggleCustomer(customer.id)}
                              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-app-bg"
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
                              <CustomerAvatar customer={customer} />
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

                      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-t border-border-color bg-card-bg px-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {/* Fixed slot so avatars never change footer height on first select */}
                          <div
                            className="flex h-6 min-w-6 shrink-0 items-center justify-start pl-0.5"
                            aria-hidden={selectedCustomers.length === 0}
                          >
                            {footerAvatars.map((customer, index) => (
                              <CustomerAvatar
                                key={customer.id}
                                customer={customer}
                                size="sm"
                                className={cn(
                                  "ring-2 ring-card-bg",
                                  index > 0 && "-ml-1.5",
                                )}
                              />
                            ))}
                            {footerOverflow > 0 ? (
                              <span className="-ml-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-app-bg px-1 text-[9px] font-bold text-text-secondary ring-2 ring-card-bg">
                                +{footerOverflow}
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[11px] font-medium text-text-secondary">
                            {selectedCustomers.length} customer
                            {selectedCustomers.length === 1 ? "" : "s"} selected
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={selectedCustomers.length === 0}
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
                  )}
                </>
              )}

              {error ? (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                  {error}
                </p>
              ) : null}
            </div>

            <DialogFooter className="shrink-0 gap-3 border-t border-border-color px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              {step === 2 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  disabled={loading}
                  className="!h-9 !rounded-md !px-3"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" strokeWidth={2} />
                  Back
                </Button>
              ) : (
                <span />
              )}
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                  className="!h-9 !rounded-md !px-4"
                >
                  Cancel
                </Button>
                {step === 1 ? (
                  <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={hydrating || roles.length === 0}
                    className="!h-9 !rounded-md !px-4"
                  >
                    Continue
                    <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2} />
                  </Button>
                ) : (
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
                )}
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
