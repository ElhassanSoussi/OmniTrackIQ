"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useOrders(from: string, to: string, limit = 50) {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  return useQuery({
    queryKey: ["orders", from, to, limit],
    queryFn: () => apiClient(`/metrics/orders?${params.toString()}`),
  });
}
