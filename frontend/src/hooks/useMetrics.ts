"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

/** Single data point for daily metrics */
export interface MetricsDailyPoint {
  date: string;
  revenue?: number;
  spend?: number;
  roas?: number;
  orders?: number;
  clicks?: number;
  impressions?: number;
  conversions?: number;
}

/** Summary KPIs for dashboard */
export interface MetricsSummary {
  revenue: number;
  spend: number;
  profit: number;
  roas: number;
  orders: number;
  clicks: number;
  impressions: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  aov: number;
  daily?: MetricsDailyPoint[];
}

/** Channel-level metrics */
export interface ChannelMetrics {
  platform: string;
  platform_label: string;
  spend: number;
  spend_percentage: number;
  revenue: number;
  roas: number;
  impressions: number;
  clicks: number;
  conversions: number;
  orders: number;
  ctr: number;
  cpc: number;
  cpa: number;
}

/** Response from /metrics/channels */
export interface ChannelBreakdownResponse {
  channels: ChannelMetrics[];
  total_spend: number;
  total_revenue: number;
}

/** Timeseries response with optional channel breakdown */
export interface TimeseriesResponse {
  data: MetricsDailyPoint[];
  by_channel?: Record<string, MetricsDailyPoint[]>;
}

/**
 * Hook to fetch metrics summary (KPIs)
 */
export function useMetrics(from: string, to: string, platform?: string) {
  const params = new URLSearchParams({ from, to });
  if (platform) params.set("platform", platform);
  
  return useQuery<MetricsSummary | undefined>({
    queryKey: ["metrics-summary", from, to, platform],
    enabled: Boolean(from && to),
    queryFn: async () => {
      const result = await apiFetch<MetricsSummary>(`/metrics/summary?${params}`);
      return result;
    },
    retry: false,
  });
}

/**
 * Hook to fetch timeseries data for charts
 */
export function useMetricsTimeseries(
  from: string, 
  to: string, 
  options?: {
    platform?: string;
    groupByChannel?: boolean;
    metrics?: string[];
  }
) {
  const params = new URLSearchParams({ from, to });
  if (options?.platform) params.set("platform", options.platform);
  if (options?.groupByChannel) params.set("group_by_channel", "true");
  if (options?.metrics) {
    options.metrics.forEach(m => params.append("metrics", m));
  }
  
  return useQuery<TimeseriesResponse | undefined>({
    queryKey: ["metrics-timeseries", from, to, options?.platform, options?.groupByChannel, options?.metrics],
    enabled: Boolean(from && to),
    queryFn: async () => {
      const result = await apiFetch<TimeseriesResponse>(`/metrics/timeseries?${params}`);
      return result;
    },
    retry: false,
  });
}

/**
 * Hook to fetch channel breakdown
 */
export function useChannelBreakdown(from: string, to: string) {
  return useQuery<ChannelBreakdownResponse | undefined>({
    queryKey: ["metrics-channels", from, to],
    enabled: Boolean(from && to),
    queryFn: async () => {
      const result = await apiFetch<ChannelBreakdownResponse>(`/metrics/channels?from=${from}&to=${to}`);
      return result;
    },
    retry: false,
  });
}

// Legacy alias for backward compatibility
export { useMetrics as useMetricsSummary };
