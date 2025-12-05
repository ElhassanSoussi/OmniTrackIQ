const DEFAULT_API_BASE_URL = "http://localhost:3001";

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
    DEFAULT_API_BASE_URL);

function getAuthToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch (err) {
    console.warn("[api-client] Unable to read auth token", err);
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | undefined> {
  const normalizedPath =
    path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  const token = getAuthToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch {}

    const msg =
      body?.detail ||
      body?.message ||
      `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  try {
    return (await res.json()) as T;
  } catch {
    return undefined;
  }
}

export const API_URL = API_BASE_URL;