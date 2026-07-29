export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export function isApiConfigured(): boolean {
  return Boolean(baseUrl);
}

export async function apiGet<T>(path: string): Promise<T> {
  if (!baseUrl) {
    throw new ApiError("API URL is not configured");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status})`, response.status);
  }

  return response.json() as Promise<T>;
}
