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

  useEffect(() => {
    async function load() {
      try {
        const me = await apiClient("/auth/me");
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { user, loading };
}
