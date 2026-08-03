// Recovers the original Error stack after h3 swallows throws into a generic 500.
// AsyncLocalStorage isolates concurrent SSR requests.

import { AsyncLocalStorage } from "node:async_hooks";

type CapturedSlot = { error: unknown; at: number };

const errorAls = new AsyncLocalStorage<CapturedSlot>();
let fallbackCaptured: CapturedSlot | undefined;
const TTL_MS = 5_000;

function record(error: unknown) {
  const slot = errorAls.getStore();
  if (slot) {
    slot.error = error;
    slot.at = Date.now();
    return;
  }
  fallbackCaptured = { error, at: Date.now() };
}

/** Run a request handler with an isolated error-capture slot. */
export function runWithErrorCapture<T>(fn: () => T): T {
  return errorAls.run({ error: undefined, at: 0 }, fn);
}

const CAUSE_DEPTH_LIMIT = 5;
const DESCRIPTION_LENGTH_LIMIT = 8_000;

export function describeError(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; depth < CAUSE_DEPTH_LIMIT && current != null; depth++) {
    if (!(current instanceof Error)) {
      parts.push(typeof current === "string" ? current : safeStringify(current));
      break;
    }
    const label = depth === 0 ? "" : "caused by: ";
    const status = describeStatus(current);
    parts.push(`${label}${current.stack ?? `${current.name}: ${current.message}`}${status}`);
    current = current.cause;
  }
  return parts.join("\n").slice(0, DESCRIPTION_LENGTH_LIMIT);
}

function describeStatus(error: Error): string {
  const { status, statusCode } = error as { status?: unknown; statusCode?: unknown };
  const value = status ?? statusCode;
  return typeof value === "number" ? ` (status ${value})` : "";
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function isErrorLike(value: unknown): value is Error {
  return value instanceof Error;
}

const originalConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const expanded = args.map((arg) => {
    if (!isErrorLike(arg)) return arg;
    record(arg);
    return describeError(arg);
  });
  originalConsoleError(...expanded);
};

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record((event as ErrorEvent).error ?? event));
  globalThis.addEventListener("unhandledrejection", (event) =>
    record((event as PromiseRejectionEvent).reason),
  );
}

export function consumeLastCapturedError(): unknown {
  const slot = errorAls.getStore() ?? fallbackCaptured;
  if (!slot?.error) return undefined;
  if (Date.now() - slot.at > TTL_MS) {
    if (slot === fallbackCaptured) fallbackCaptured = undefined;
    else {
      slot.error = undefined;
      slot.at = 0;
    }
    return undefined;
  }
  const { error } = slot;
  if (slot === fallbackCaptured) fallbackCaptured = undefined;
  else {
    slot.error = undefined;
    slot.at = 0;
  }
  return error;
}
