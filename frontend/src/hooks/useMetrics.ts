"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type MetricsSummary = {
  revenue: number;
  spend: number;
  roas: number;
  orders: number;
  daily?: Array<{
    date: string;
    spend: number;
    revenue?: number;
    orders?: number;
  }>;
};

export function useMetrics(from: string, to: string): UseQueryResult<MetricsSummary | undefined> {
  return useQuery<MetricsSummary | undefined>({
    queryKey: ["summary", from, to],
    enabled: Boolean(from && to),
    queryFn: () => apiFetch<MetricsSummary>(`/metrics/summary?from=${from}&to=${to}`),
    retry: false,
  });
}
