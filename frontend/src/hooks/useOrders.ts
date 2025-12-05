"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// Type for orders response
interface OrdersResponse {
  items?: any[];
  orders?: any[];
  results?: any[];
  [key: string]: any;
}

export function useOrders(from: string, to: string): UseQueryResult<OrdersResponse | undefined, Error> {
  return useQuery<OrdersResponse | undefined, Error>({
    queryKey: ["orders", from, to],
    enabled: Boolean(from && to),
    queryFn: () => apiFetch<OrdersResponse>(`/metrics/orders?from=${from}&to=${to}`),
    retry: false,
  });
}
