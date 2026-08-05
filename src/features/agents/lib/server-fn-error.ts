import { setResponseStatus } from "@tanstack/react-start/server";

/** Expected client/API failures — not opaque 500s. */
export function throwHttpError(message: string, status: number): never {
  setResponseStatus(status);
  throw new Error(message);
}
