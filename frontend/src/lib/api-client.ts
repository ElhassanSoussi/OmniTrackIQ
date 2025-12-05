const DEFAULT_API_BASE_URL = "http://localhost:3001";
export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn(
    `[api-client] NEXT_PUBLIC_API_URL is not set; defaulting to ${DEFAULT_API_BASE_URL}`,
  );
}

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch (err) {
    console.warn("[api-client] Unable to read auth token", err);
    return null;
  }
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
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
    } catch {
      // ignore
    }
    const message =
      body?.detail || body?.message || `Request failed with ${res.status}`;
    throw new Error(message);
  }

  try {
    return (await res.json()) as T;
  } catch {
    // empty body
    return undefined as T;
  }
}

