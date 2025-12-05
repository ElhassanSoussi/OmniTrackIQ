"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

type OrdersResponse = {
  items?: any[];
  orders?: any[];
  results?: any[];
  [key: string]: any;  // Allow additional properties
} | any[];  // Can also be an array

export function useOrders(from: string, to: string): UseQueryResult<OrdersResponse | undefined> {
  return useQuery<OrdersResponse | undefined>({
    queryKey: ["orders", from, to],
    enabled: Boolean(from && to),
    queryFn: () => apiFetch<OrdersResponse>(`/metrics/orders?from=${from}&to=${to}`),
    retry: false,
  });
}
