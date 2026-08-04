import { useEffect, useEffectEvent, useRef, useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createAgent, updateAgent } from "@/features/agents/api/agents.api";
import { canGrantAllCustomers, creatableRoles } from "@/features/agents/lib/agent-permissions";
import { getClientErrorMessage } from "@/features/agents/lib/client-error";
import {
  formValuesToCustomerScope,
  validateAgentPasswords,
} from "@/features/agents/validations/agent-form.schema";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { usePasswordEndAction } from "@/shared/components/FloatingLabelField";
import { cn } from "@/lib/utils";
import type { ReportActor } from "@/shared/types/agent";

import { useAgentFormState } from "@/features/agents/hooks/use-agent-form";
import { AgentInfoSection } from "@/features/agents/components/AgentInfoSection";
import { AgentAccessSection } from "@/features/agents/components/AgentAccessSection";

type FormSection = "info" | "access";

const FORM_SECTIONS: { id: FormSection; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "access", label: "Access" },
];

/** Top inset when jumping to a section (matches scroll pane `pt-5`). */
const SECTION_TOP_INSET = 20;

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
  const roles = creatableRoles(actor);
  const canAll = canGrantAllCustomers(actor);
  const defaultRole = roles[0] ?? "user";
  const defaultScopeType = canAll ? "all" : "specific";

  const {
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
  } = useAgentFormState({
    open,
    mode,
    agentId,
    actor,
    canAll,
    defaultRole,
    defaultScopeType,
  });

  const [activeSection, setActiveSection] = useState<FormSection>("info");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLElement>(null);
  const accessRef = useRef<HTMLElement>(null);
  const scrollingToSectionRef = useRef(false);

  const isEditingSelf = mode === "edit" && agentId === actor.id;
  const isCreate = mode === "create";
  const showPasswordFields = isCreate || form.changePassword;
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
    setActiveSection("info");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [open]);

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
  }, [hydrating, open, onScrollSync]);

  useEffect(() => {
    if (!open || hydrating) return;
    const root = scrollRef.current;
    const access = accessRef.current;
    if (!root || !access) return;

    updateAccessMinHeight();

    const observer = new ResizeObserver(() => updateAccessMinHeight());
    observer.observe(root);
    return () => observer.disconnect();
  }, [open, hydrating, updateAccessMinHeight]);

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

    if (!form.name.trim()) {
      setError("Full name is required.");
      scrollToSection("info");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setError("Enter a valid email address.");
      scrollToSection("info");
      return;
    }
    const passwordError = validateAgentPasswords(form, mode);
    if (passwordError) {
      setError(passwordError);
      scrollToSection("info");
      return;
    }

    if (form.scopeType === "specific" && form.customerIds.length === 0) {
      setError("Select at least one customer, or choose All customers.");
      scrollToSection("access");
      return;
    }

    const shared = {
      name: form.name,
      email: form.email,
      role: form.role,
      isActive: form.isActive,
      customerScope: formValuesToCustomerScope(form),
    };

    setLoading(true);
    try {
      if (isCreate) {
        await createAgent({ ...shared, password: form.password });
        toast.success("Agent created");
      } else if (agentId) {
        await updateAgent(
          agentId,
          {
            ...shared,
            password: form.changePassword ? form.password : undefined,
          },
          actor,
        );
        toast.success("Agent updated");
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      const message = getClientErrorMessage(e);
      setError(message);
      toast.error(message);
      if (message.toLowerCase().includes("email")) {
        scrollToSection("info");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(92vh,820px)] max-h-[min(92vh,820px)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-0 border-b border-border-color px-6 py-5 text-left">
          <DialogTitle className="text-[18px] font-bold tracking-tight text-text-primary">
            {isCreate ? "Add agent" : "Edit agent"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-text-secondary">
            {isCreate
              ? "Create a new agent and define their access."
              : "Update this agent’s details and access."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
          <SectionNav activeSection={activeSection} onSelect={scrollToSection} />

          <div
            ref={scrollRef}
            className="min-h-0 min-w-0 flex-1 space-y-8 overflow-y-auto px-6 py-5"
          >
            {hydrating ? (
              <p className="py-10 text-center text-[13px] text-text-muted">Loading agent…</p>
            ) : (
              <>
                <section ref={infoRef} id="agent-form-info" className="scroll-mt-2 space-y-4">
                  <AgentInfoSection
                    form={form}
                    patch={patch}
                    isCreate={isCreate}
                    isEditingSelf={isEditingSelf}
                    roles={roles}
                    showPasswordFields={showPasswordFields}
                    showPassword={showPassword}
                    showConfirmPassword={showConfirmPassword}
                    passwordEndAction={passwordEndAction}
                    confirmPasswordEndAction={confirmPasswordEndAction}
                  />
                </section>

                <section
                  ref={accessRef}
                  id="agent-form-access"
                  className="flex min-h-0 scroll-mt-2 flex-col gap-4"
                >
                  <AgentAccessSection
                    form={form}
                    patch={patch}
                    canAll={canAll}
                    customersDisabled={customersDisabled}
                    customerQuery={customerQuery}
                    setCustomerQuery={setCustomerQuery}
                    viewSelectedOnly={viewSelectedOnly}
                    setViewSelectedOnly={setViewSelectedOnly}
                    assignableCustomers={assignableCustomers}
                    selectedCustomers={selectedCustomers}
                    filteredCustomers={filteredCustomers}
                    toggleCustomer={toggleCustomer}
                  />
                </section>
              </>
            )}

            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-3 border-t border-border-color px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={() => void handleSubmit()}
            loading={loading}
            disabled={hydrating || roles.length === 0}
          >
            {isCreate ? (
              <>
                <UserPlus className="h-5 w-5" strokeWidth={2} />
                Create agent
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
