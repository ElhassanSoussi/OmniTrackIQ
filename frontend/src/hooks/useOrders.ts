"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useOrders(from: string, to: string) {
  return useQuery({
    queryKey: ["orders", from, to],
    enabled: Boolean(from && to),
    queryFn: () => apiClient(`/metrics/orders?from=${from}&to=${to}`),
    retry: false,
  });
}
