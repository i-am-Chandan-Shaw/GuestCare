import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { normalizeSessionAgent } from "@/features/auth/lib/normalize-agent";
import type { Agent } from "@/shared/types/agent";
import type { AuthSession } from "@/features/auth/types";

const COOKIE = "gc_session";
const MAX_AGE_SECONDS = 8 * 60 * 60;

interface SessionPayload {
  userId: string;
  email: string;
  agent: Agent;
  exp: number;
}

function getSecret() {
  return process.env.AUTH_SECRET ?? "dev-only-guestcare-auth-secret-min-32-chars!!";
}

function secureSuffix() {
  return process.env.NODE_ENV === "production" ? "; Secure" : "";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function hmacVerify(value: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64Url(signature),
    new TextEncoder().encode(value),
  );
}

export function readSessionCookie(): string | null {
  const header = getRequestHeader("cookie");
  if (!header) return null;

  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === COOKIE) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}

export function setSessionCookie(token: string) {
  setResponseHeader(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}${secureSuffix()}`,
  );
}

export function clearSessionCookie() {
  setResponseHeader(
    "Set-Cookie",
    `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureSuffix()}`,
  );
}

export async function createSessionToken(session: AuthSession): Promise<string> {
  const payload: SessionPayload = {
    userId: session.userId,
    email: session.email,
    agent: session.agent,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSign(encoded);
  return `${encoded}.${signature}`;
}

export async function parseSessionToken(token: string): Promise<AuthSession | null> {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const encoded = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!(await hmacVerify(encoded, signature))) return null;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encoded)),
    ) as SessionPayload;

    if (!payload.userId || !payload.email || !payload.agent) return null;
    if (payload.exp <= Date.now()) return null;

    const agent = normalizeSessionAgent(payload.agent);
    if (!agent) return null;

    return {
      userId: payload.userId,
      email: payload.email,
      agent,
    };
  } catch {
    return null;
  }
}
