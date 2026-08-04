export type AgentFormFieldKey =
  | "name"
  | "email"
  | "password"
  | "confirmPassword"
  | "role"
  | "customers";

export type AgentFormFieldErrors = Partial<Record<AgentFormFieldKey, string>>;

const FIELD_KEYS_FROM_FORM: Partial<Record<string, AgentFormFieldKey | AgentFormFieldKey[]>> = {
  name: "name",
  email: "email",
  password: "password",
  confirmPassword: "confirmPassword",
  role: "role",
  customerIds: "customers",
  scopeType: "customers",
};

export function clearFieldErrorsForPatch(
  prev: AgentFormFieldErrors,
  partial: Record<string, unknown>,
): AgentFormFieldErrors {
  const next = { ...prev };
  for (const key of Object.keys(partial)) {
    const mapped = FIELD_KEYS_FROM_FORM[key];
    if (!mapped) continue;
    if (Array.isArray(mapped)) {
      for (const field of mapped) delete next[field];
    } else {
      delete next[mapped];
    }
  }
  return next;
}
