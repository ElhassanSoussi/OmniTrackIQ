"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type OrderRecord = {
  id?: string;
  external_order_id?: string;
  date_time?: string;
  date?: string;
  total_amount?: number;
  amount?: number;
  currency?: string;
  source_platform?: string;
  source?: string;
  utm_source?: string;
  utmSource?: string;
  utm_campaign?: string;
  utmCampaign?: string;
};

export type OrdersResponse =
  | OrderRecord[]
  | { items?: OrderRecord[]; orders?: OrderRecord[]; results?: OrderRecord[] }
  | [unknown, OrderRecord[]]
  | undefined;

function normalizeOrders(response?: OrdersResponse): OrderRecord[] {
  if (!response) return [];

  if (Array.isArray(response)) {
    return Array.isArray(response[1]) ? response[1] : response;
  }

  return response.items || response.orders || response.results || [];
}

export function useOrders(from: string, to: string) {
  return useQuery<OrderRecord[], Error>({
    queryKey: ["orders", from, to],
    enabled: Boolean(from && to),
    queryFn: async () => {
      const response = await apiFetch<OrdersResponse>(`/metrics/orders?from=${from}&to=${to}`);
      return normalizeOrders(response);
    },
    retry: false,
    placeholderData: [],
  });
}
