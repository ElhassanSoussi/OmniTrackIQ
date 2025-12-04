const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://omnitrackiq-backend.onrender.com";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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

export { API_BASE_URL };
