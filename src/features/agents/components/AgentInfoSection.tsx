import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Select, type FloatingEndAction } from "@/shared/components/FloatingLabelField";
import {
  getPasswordRequirementState,
  roleOptionLabels,
  type AgentFormValues,
} from "@/features/agents/validations/agent-form.schema";
import type { AgentRole } from "@/shared/types/agent";

export function PasswordRequirementPills({ password }: { password: string }) {
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

export function AgentInfoSection({
  form,
  patch,
  isCreate,
  isEditingSelf,
  roles,
  showPasswordFields,
  showPassword,
  showConfirmPassword,
  passwordEndAction,
  confirmPasswordEndAction,
}: {
  form: AgentFormValues;
  patch: (partial: Partial<AgentFormValues>) => void;
  isCreate: boolean;
  isEditingSelf: boolean;
  roles: AgentRole[];
  showPasswordFields: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  passwordEndAction: FloatingEndAction;
  confirmPasswordEndAction: FloatingEndAction;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-bold text-text-primary">Info</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Full name" value={form.name} onChange={(v) => patch({ name: v })} />
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
        {!isCreate && !form.changePassword ? (
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
            {!isCreate ? (
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
                label={isCreate ? "Password" : "New password"}
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
    </div>
  );
}
