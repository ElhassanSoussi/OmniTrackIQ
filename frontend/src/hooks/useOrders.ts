"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface OrderRecord {
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
  utm_medium?: string;
  attributed_channel?: string;
  attributed_campaign?: string;
}

export interface OrdersResponseData {
  items: OrderRecord[];
  total: number;
  page: number;
  per_page: number;
  total_revenue: number;
  total_orders: number;
  aov: number;
}

// Flexible response type to handle various API response shapes
export interface OrdersResponseLegacy {
  items?: OrderRecord[];
  orders?: OrderRecord[];
  results?: OrderRecord[];
}

export type OrdersResponse =
  | OrderRecord[]
  | OrdersResponseData
  | OrdersResponseLegacy
  | [unknown, OrderRecord[]]
  | undefined;

/** Daily orders data point */
export interface OrdersDailyPoint {
  date: string;
  orders: number;
  revenue: number;
}

/** Enhanced orders summary with daily timeseries */
export interface OrdersSummary {
  total_orders: number;
  total_revenue: number;
  aov: number;
  orders_by_source: Record<string, number>;
  revenue_by_source: Record<string, number>;
  daily?: OrdersDailyPoint[];
}

/** Order item for paginated list */
export interface OrderListItem {
  id: string;
  external_order_id: string;
  date_time: string;
  total_amount: number;
  currency: string;
  utm_source?: string;
  utm_campaign?: string;
  source_platform: string;
  attributed_channel: string;
  attributed_campaign?: string;
}

/** Paginated orders list response */
export interface OrdersListResponse {
  items: OrderListItem[];
  total_count: number;
  page: number;
  page_size: number;
}

/**
 * Fetch orders list with pagination (legacy endpoint)
 */
export function useOrders(from: string, to: string, options?: { utm_source?: string; limit?: number }) {
  const params = new URLSearchParams({ from, to });
  if (options?.utm_source) params.set("utm_source", options.utm_source);
  if (options?.limit) params.set("limit", String(options.limit));
  
  return useQuery<OrdersResponse>({
    queryKey: ["orders", from, to, options?.utm_source, options?.limit],
    enabled: Boolean(from && to),
    queryFn: async () => {
      const result = await apiFetch<OrdersResponse>(`/metrics/orders?${params}`);
      return result as OrdersResponse;
    },
    retry: false,
  });
}

/**
 * Fetch orders summary with attribution breakdown
 */
export function useOrdersSummary(from: string, to: string) {
  return useQuery<OrdersSummary>({
    queryKey: ["orders-summary", from, to],
    enabled: Boolean(from && to),
    queryFn: async () => {
      const result = await apiFetch<OrdersSummary>(`/metrics/orders/summary?from=${from}&to=${to}`);
      return result as OrdersSummary;
    },
    retry: false,
  });
}

/**
 * Fetch paginated orders list with search and filtering
 */
export function useOrdersList(
  from: string,
  to: string,
  options?: {
    channel?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }
) {
  const params = new URLSearchParams({ from, to });
  if (options?.channel) params.set("channel", options.channel);
  if (options?.search) params.set("search", options.search);
  if (options?.page) params.set("page", String(options.page));
  if (options?.pageSize) params.set("page_size", String(options.pageSize));

  return useQuery<OrdersListResponse>({
    queryKey: ["orders-list", from, to, options?.channel, options?.search, options?.page, options?.pageSize],
    enabled: Boolean(from && to),
    queryFn: async () => {
      const result = await apiFetch<OrdersListResponse>(`/metrics/orders/list?${params}`);
      return result as OrdersListResponse;
    },
    retry: false,
  });
}
