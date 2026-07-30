import { z } from "zod";
import type { AgentCustomerScope, AgentRole } from "@/shared/types/agent";

export const PASSWORD_RULES = [
  {
    id: "length",
    label: "8+ characters",
    test: (password: string) => password.length >= 8,
  },
  {
    id: "upper",
    label: "1 uppercase letter",
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "1 number",
    test: (password: string) => /\d/.test(password),
  },
  {
    id: "special",
    label: "1 special character",
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const;

export function getPasswordRequirementState(password: string) {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password),
  }));
}

export function isPasswordStrong(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export const agentFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Enter a valid email"),
    role: z.enum(["admin", "manager", "user"]),
    isActive: z.boolean(),
    scopeType: z.enum(["all", "specific"]),
    customerIds: z.array(z.string()),
    password: z.string(),
    confirmPassword: z.string(),
    changePassword: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.scopeType === "specific" && value.customerIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one customer",
        path: ["customerIds"],
      });
    }
  });

export type AgentFormValues = z.infer<typeof agentFormSchema>;

export function validateAgentPasswords(
  values: AgentFormValues,
  mode: "create" | "edit",
): string | null {
  const needsPassword = mode === "create" || values.changePassword;
  if (!needsPassword) return null;

  if (!isPasswordStrong(values.password)) {
    return "Password must be 8+ characters with uppercase, number, and special character.";
  }
  if (values.password !== values.confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

export function formValuesToCustomerScope(values: AgentFormValues): AgentCustomerScope {
  if (values.scopeType === "all") return { type: "all" };
  return { type: "specific", customerIds: [...values.customerIds] };
}

export function roleOptionLabels(roles: AgentRole[]): Record<string, string> {
  return Object.fromEntries(
    roles.map((role) => [role, role.charAt(0).toUpperCase() + role.slice(1)]),
  );
}

export const ROLE_HELPER_COPY: Record<AgentRole, string> = {
  admin: "Admins can manage agents, settings and all customers.",
  manager: "Managers can create users and manage customers in their scope.",
  user: "Users can work assigned reports for customers they can access.",
};
