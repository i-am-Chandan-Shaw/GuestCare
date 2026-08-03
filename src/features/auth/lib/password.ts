/**
 * Must match `.env.example` / seed digests in `agents.seed.ts`.
 * Used when AUTH_SECRET is unavailable in the browser (Vite does not expose it).
 */
const DEMO_PASSWORD_PEPPER = "dev-only-guestcare-auth-secret-min-32-chars!!";

/** Pepper for mock password digests. Prefer AUTH_SECRET on the server. */
export function getPasswordPepper(): string {
  return process.env.AUTH_SECRET || DEMO_PASSWORD_PEPPER;
}

function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** SHA-256 via Web Crypto — works in browser and Node (no node:crypto). */
export async function hashPassword(
  password: string,
  pepper = getPasswordPepper(),
): Promise<string> {
  const data = new TextEncoder().encode(`${pepper}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export async function verifyPassword(
  password: string,
  expectedHash: string,
  pepper = getPasswordPepper(),
): Promise<boolean> {
  const actual = await hashPassword(password, pepper);
  if (actual.length !== expectedHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < actual.length; i++) {
    mismatch |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return mismatch === 0;
}
