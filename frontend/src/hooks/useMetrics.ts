"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type MetricsDailyPoint = {
  date: string;
  revenue?: number;
  spend?: number;
  roas?: number;
  orders?: number;
};

export type MetricsSummary = {
  revenue: number;
  spend: number;
  roas: number;
  orders: number;
  daily?: MetricsDailyPoint[];
};

export function useMetrics(from: string, to: string) {
  return useQuery<MetricsSummary>({
    queryKey: ["summary", from, to],
    enabled: Boolean(from && to),
    queryFn: () => apiFetch<MetricsSummary>(`/metrics/summary?from=${from}&to=${to}`),
    retry: false,
  });
}
