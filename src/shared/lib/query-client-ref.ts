import type { QueryClient } from "@tanstack/react-query";

let _queryClient: QueryClient | null = null;

export function setQueryClientRef(client: QueryClient) {
  _queryClient = client;
}

export function getQueryClientRef(): QueryClient {
  if (!_queryClient) {
    throw new Error("QueryClient ref not set. Call setQueryClientRef during app init.");
  }
  return _queryClient;
}
