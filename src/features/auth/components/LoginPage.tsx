import { LifeBuoy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { login } from "@/features/auth/api/auth.api";
import { loginSchema } from "@/features/auth/lib/login-schema";
import { safeRedirectPath } from "@/features/auth/lib/require-auth";
import { Field, Input } from "@/features/incidents/components/incident-form-controls";

export function LoginPage({ redirectTo }: { redirectTo?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(parsed.data);
      window.location.assign(safeRedirectPath(redirectTo));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border-color bg-card-bg p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-primary/20 bg-brand-primary/10">
            <LifeBuoy className="h-6 w-6 text-brand-primary" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-text-primary">
            GuestCare
          </h1>
          <p className="mt-2 text-sm text-text-secondary">Sign in to Live Copilot</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@guestcare.io"
              className="h-11"
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              className="h-11"
            />
          </Field>

          {error && (
            <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
