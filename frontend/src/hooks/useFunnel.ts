import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// Types for funnel data
export interface FunnelStage {
  id: string;
  name: string;
  value: number;
  percentage: number;
  drop_off: number;
  drop_off_rate: number;
}

export interface FunnelSummary {
  total_impressions: number;
  total_clicks: number;
  total_purchases: number;
  total_revenue: number;
  overall_conversion_rate: number;
  click_through_rate: number;
  average_order_value: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface FunnelDataResponse {
  stages: FunnelStage[];
  summary: FunnelSummary;
  date_range: DateRange;
}

export type FunnelCompareBy = "platform" | "time_period";

export interface FunnelSegmentComparison {
  segment: string;
  segment_label: string;
  stages: FunnelStage[];
  summary: FunnelSummary;
}

export interface FunnelComparisonResponse {
  compare_by: string;
  comparisons: FunnelSegmentComparison[];
  date_range: DateRange;
}

export interface MetricChange {
  current: number;
  previous: number;
  change: number;
  change_percentage: number;
}

export interface FunnelTimePeriodComparison {
  compare_by: string;
  current_period: {
    from: string;
    to: string;
    stages: FunnelStage[];
    summary: FunnelSummary;
  };
  previous_period: {
    from: string;
    to: string;
    stages: FunnelStage[];
    summary: FunnelSummary;
  };
  changes: Record<string, MetricChange>;
}

export type FunnelGranularity = "daily" | "weekly";

export interface FunnelTrendPoint {
  period: string;
  impressions: number;
  clicks: number;
  ctr: number;
  purchases: number;
  revenue: number;
  conversion_rate: number;
}

export interface FunnelTrendsResponse {
  granularity: string;
  trends: FunnelTrendPoint[];
  date_range: DateRange;
}

export interface FunnelStageDefinition {
  id: string;
  name: string;
  description: string;
}

export interface FunnelMetadataResponse {
  default_stages: FunnelStageDefinition[];
  compare_options: string[];
  granularity_options: string[];
}

// Hooks

export function useFunnelMetadata() {
  return useQuery<FunnelMetadataResponse>({
    queryKey: ["funnel-metadata"],
    queryFn: async () => {
      const result = await apiFetch("/funnel/metadata");
      return result as FunnelMetadataResponse;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useFunnelData(
  dateFrom?: string,
  dateTo?: string,
  platform?: string,
) {
  return useQuery<FunnelDataResponse>({
    queryKey: ["funnel-data", dateFrom, dateTo, platform],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (platform) params.set("platform", platform);
      
      const result = await apiFetch(`/funnel?${params}`);
      return result as FunnelDataResponse;
    },
  });
}

export function useFunnelComparison(
  dateFrom?: string,
  dateTo?: string,
  compareBy: FunnelCompareBy = "platform",
) {
  return useQuery<FunnelComparisonResponse | FunnelTimePeriodComparison>({
    queryKey: ["funnel-comparison", dateFrom, dateTo, compareBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("compare_by", compareBy);
      
      const result = await apiFetch(`/funnel/comparison?${params}`);
      return result as FunnelComparisonResponse | FunnelTimePeriodComparison;
    },
  });
}

export function useFunnelTrends(
  dateFrom?: string,
  dateTo?: string,
  granularity: FunnelGranularity = "daily",
) {
  return useQuery<FunnelTrendsResponse>({
    queryKey: ["funnel-trends", dateFrom, dateTo, granularity],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("granularity", granularity);
      
      const result = await apiFetch(`/funnel/trends?${params}`);
      return result as FunnelTrendsResponse;
    },
  });
}
