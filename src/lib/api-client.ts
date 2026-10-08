// ============================================
// API CLIENT
// Shared fetch wrapper for all service files.
// Handles base URL, auth headers, and error parsing.
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const isFormData = body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(headers as Record<string, string>),
  };

  if (typeof document !== "undefined" && rest.method && rest.method !== "GET") {
    const xsrfCookie = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("XSRF-TOKEN="));

    if (xsrfCookie) {
      finalHeaders["X-XSRF-TOKEN"] = decodeURIComponent(xsrfCookie.slice("XSRF-TOKEN=".length));
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    credentials: "include",
    headers: finalHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || "Something went wrong. Please try again.";
    throw new ApiError(message, res.status, data?.errors);
  }

  return data as T;
}
