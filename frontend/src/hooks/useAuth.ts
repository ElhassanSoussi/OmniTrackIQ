"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { formatErrorMessage } from "@/lib/format";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (params: { email: string; password: string; accountName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await apiFetch<AuthUser>("/auth/me");
      setUser(me || null);
    } catch (err) {
      setUser(null);
      const message = formatErrorMessage(err);
      if (!message.includes("401") && !message.toLowerCase().includes("unauthorized")) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<{ access_token?: string; user?: AuthUser }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        if (typeof window !== "undefined" && res?.access_token) {
          localStorage.setItem("token", res.access_token);
        }

        await refresh();
      } catch (err) {
        const message = formatErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const signup = useCallback(
    async ({ email, password, accountName }: { email: string; password: string; accountName?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<{ access_token?: string; user?: AuthUser }>("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password, account_name: accountName }),
        });

        if (typeof window !== "undefined" && res?.access_token) {
          localStorage.setItem("token", res.access_token);
        }

        await refresh();
      } catch (err) {
        const message = formatErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Call logout endpoint (best-effort, we'll clear local state regardless)
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors - we'll clear local state regardless
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setLoading(false);
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, loading, error, login, signup, logout, refresh };
}
