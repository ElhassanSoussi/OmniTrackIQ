
// Default to localhost for development; in production, NEXT_PUBLIC_API_URL must be set
const DEFAULT_API_BASE_URL = "http://localhost:8000";

function normalizeBaseUrl(rawValue: string | undefined): string {
  if (!rawValue) return DEFAULT_API_BASE_URL;

  const withProtocol = /^https?:\/\//i.test(rawValue)
    ? rawValue
    : `https://${rawValue}`;

  return withProtocol.replace(/\/+$/, "");
}

const envBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const API_BASE_URL = normalizeBaseUrl(envBaseUrl);

// Only warn in development when env var is missing
if (!envBaseUrl && typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  console.warn(
    `[api-client] NEXT_PUBLIC_API_URL is not set. Falling back to ${DEFAULT_API_BASE_URL}. Set NEXT_PUBLIC_API_URL to your backend URL.`,
  );
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch (err) {
    console.warn("[api-client] Unable to read auth token", err);
    return null;
  }
}

/**
 * Determines if a fetch error is a network/CORS error vs an HTTP error.
 * Network errors include: CORS blocked, DNS failure, server unreachable, SSL errors.
 */
function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("load failed") || // Safari
    msg.includes("failed to fetch") || // Chrome/Firefox
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("cors") ||
    msg.includes("net::") // Chrome network errors
  );
}

/**
 * Make an authenticated API request to the backend.
 * Handles auth token injection, error parsing, and network error detection.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | undefined> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  const token = getAuthToken();

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      credentials: "include",
    });
  } catch (err) {
    // Network-level error (CORS, DNS, server down, etc.)
    if (isNetworkError(err)) {
      console.error(`[api-client] Network error fetching ${url}:`, err);
      throw new Error(
        "Unable to connect to the server. Please check your internet connection or try again later."
      );
    }
    // Re-throw other unexpected errors
    throw err;
  }

  // Handle HTTP errors (4xx, 5xx)
  if (!res.ok) {
    let body: Record<string, unknown> | null = null;
    try {
      body = await res.json();
    } catch {
      // Response body wasn't JSON, ignore
    }

    // Extract error message from various API response formats
    const detail = body?.detail;
    const msg =
      (typeof detail === "string" ? detail : null) ||
      (typeof body?.message === "string" ? body.message : null) ||
      (typeof body?.error === "string" ? body.error : null) ||
      getHttpErrorMessage(res.status);

    throw new Error(msg);
  }

  // Parse successful response
  try {
    return (await res.json()) as T;
  } catch {
    // Empty response body (e.g., 204 No Content)
    return undefined;
  }
}

/**
 * Returns a user-friendly message for common HTTP status codes.
 */
function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Please log in to continue.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This resource already exists.";
    case 422:
      return "Invalid data provided. Please check your input.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Server error. Please try again later.";
    default:
      return `Request failed (${status})`;
  }
}

export const API_URL = API_BASE_URL;

