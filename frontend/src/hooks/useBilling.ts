"use client";

import { apiFetch } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export function useBilling() {
  const { data, refetch, isLoading, isError, error } = useQuery({
    queryKey: ["billing"],
    queryFn: () => apiFetch("/billing/me"),
    retry: false,
  });

  async function createCheckout(plan: string) {
    const { url } = await apiFetch<{ url: string }>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    });
    window.location.href = url;
  }

  async function openPortal() {
    const { url } = await apiFetch<{ url: string }>("/billing/portal", {
      method: "POST",
    });

    window.location.href = url;
  }

  return {
    plan: data,
    reload: refetch,
    isLoading,
    isError,
    error: error as Error | null,
    createCheckout,
    openPortal,
  };
}
