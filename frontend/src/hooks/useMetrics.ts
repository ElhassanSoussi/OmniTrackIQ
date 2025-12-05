"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// Type for the metrics summary response
interface MetricsSummary {
  revenue: number;
  spend: number;
  roas: number;
  orders: number;
  daily?: Array<{
    date: string;
    spend: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export function useMetrics(from: string, to: string): UseQueryResult<MetricsSummary | undefined, Error> {
  return useQuery<MetricsSummary | undefined, Error>({
    queryKey: ["summary", from, to],
    enabled: Boolean(from && to),
    queryFn: () => apiFetch<MetricsSummary>(`/metrics/summary?from=${from}&to=${to}`),
    retry: false,
  });
}
