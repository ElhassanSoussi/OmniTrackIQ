"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

/** Campaign performance metrics from API */
export interface CampaignMetrics {
  campaign_id: string;
  campaign_name?: string;
  name?: string;
  platform?: string;
  platform_label?: string;
  spend?: number;
  revenue?: number;
  roas?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  ctr?: number;
  cpc?: number;
  cpa?: number;
  status?: string;
}

/** Single campaign summary with all KPIs */
export interface CampaignSummary {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  platform_label: string;
  spend: number;
  revenue: number;
  roas: number;
  profit: number;
  impressions: number;
  clicks: number;
  conversions: number;
  orders: number;
  ctr: number;
  cpc: number;
  cpa: number;
  aov: number;
}

/** Daily data point for campaign timeseries */
export interface CampaignTimeseriesPoint {
  date: string;
  spend?: number;
  revenue?: number;
  roas?: number;
  clicks?: number;
  impressions?: number;
  conversions?: number;
  orders?: number;
}

/** Response from campaign timeseries endpoint */
export interface CampaignTimeseriesResponse {
  data: CampaignTimeseriesPoint[];
}

/** Campaign detail with summary and daily breakdown */
export interface CampaignDetail {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  summary: CampaignMetrics;
  daily: CampaignTimeseriesPoint[];
}

/**
 * Hook to fetch list of campaigns with metrics
 */
export function useCampaigns(
  from: string, 
  to: string, 
  options?: {
    platform?: string;
    sortBy?: string;
    limit?: number;
  }
) {
  const params = new URLSearchParams({ from, to });
  if (options?.platform) params.set("platform", options.platform);
  if (options?.sortBy) params.set("sort_by", options.sortBy);
  if (options?.limit) params.set("limit", String(options.limit));

  return useQuery<CampaignMetrics[]>({
    queryKey: ["campaigns", from, to, options?.platform, options?.sortBy, options?.limit],
    enabled: Boolean(from && to),
    queryFn: async () => {
      const result = await apiFetch<CampaignMetrics[]>(`/metrics/campaigns?${params}`);
      return result as CampaignMetrics[];
    },
    retry: false,
  });
}

/**
 * Hook to fetch single campaign detail
 */
export function useCampaignDetail(campaignId: string, from: string, to: string) {
  return useQuery<CampaignDetail | undefined>({
    queryKey: ["campaign-detail", campaignId, from, to],
    enabled: Boolean(campaignId && from && to),
    queryFn: async () => {
      const result = await apiFetch<CampaignDetail>(
        `/metrics/campaigns/${encodeURIComponent(campaignId)}?from=${from}&to=${to}`
      );
      return result;
    },
    retry: false,
  });
}

/**
 * Hook to fetch single campaign summary
 */
export function useCampaignSummary(campaignId: string, from: string, to: string) {
  return useQuery<CampaignSummary | undefined>({
    queryKey: ["campaign-summary", campaignId, from, to],
    enabled: Boolean(campaignId && from && to),
    queryFn: async () => {
      const result = await apiFetch<CampaignSummary>(
        `/metrics/campaigns/${encodeURIComponent(campaignId)}/summary?from=${from}&to=${to}`
      );
      return result;
    },
    retry: false,
  });
}

/**
 * Hook to fetch campaign timeseries for charts
 */
export function useCampaignTimeseries(campaignId: string, from: string, to: string) {
  return useQuery<CampaignTimeseriesResponse | undefined>({
    queryKey: ["campaign-timeseries", campaignId, from, to],
    enabled: Boolean(campaignId && from && to),
    queryFn: async () => {
      const result = await apiFetch<CampaignTimeseriesResponse>(
        `/metrics/campaigns/${encodeURIComponent(campaignId)}/timeseries?from=${from}&to=${to}`
      );
      return result;
    },
    retry: false,
  });
}
