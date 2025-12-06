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

type MetricsSummaryResponse = {
  revenue?: number | null;
  spend?: number | null;
  roas?: number | null;
  orders?: number | null;
  daily?: MetricsDailyPoint[];
};

function normalizeDaily(points?: MetricsDailyPoint[]): MetricsDailyPoint[] | undefined {
  if (!points?.length) return undefined;

  return points.map((point) => ({
    date: point.date,
    revenue: point.revenue ?? undefined,
    spend: point.spend ?? undefined,
    roas: point.roas ?? undefined,
    orders: point.orders ?? undefined,
  }));
}

function normalizeSummary(data?: MetricsSummaryResponse): MetricsSummary {
  return {
    revenue: Number(data?.revenue ?? 0),
    spend: Number(data?.spend ?? 0),
    roas: Number(data?.roas ?? 0),
    orders: Number(data?.orders ?? 0),
    daily: normalizeDaily(data?.daily),
  };
}

export function useMetricsSummary(from: string, to: string) {
  return useQuery<MetricsSummary, Error, MetricsSummary>({
    queryKey: ["metrics", "summary", from, to],
    enabled: Boolean(from && to),
    retry: false,
    queryFn: async () => {
      const response = await apiFetch<MetricsSummaryResponse>(`/metrics/summary?from=${from}&to=${to}`);
      return normalizeSummary(response);
    },
    placeholderData: normalizeSummary(),
  });
}

export { useMetricsSummary as useMetrics };
