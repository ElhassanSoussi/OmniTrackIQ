"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  account_id: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMe() {
    setLoading(true);
    try {
      const me = await apiClient("/auth/me");
      setUser(me);
      setError(null);
    } catch (err: any) {
      setUser(null);
      setError(err?.message || "Unable to load session");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  return { user, loading, error, reload: loadMe };
}
