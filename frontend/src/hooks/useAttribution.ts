import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type AttributionModel = 
  | "first_touch" 
  | "last_touch" 
  | "linear" 
  | "time_decay" 
  | "position_based";

export interface AttributionChannel {
  channel: string;
  attributed_revenue: number;
  attributed_conversions: number;
  avg_order_value: number;
  spend: number;
  roas: number;
  cpa: number;
  revenue_share: number;
}

export interface AttributionReport {
  model: string;
  date_from: string;
  date_to: string;
  lookback_days: number;
  total_revenue: number;
  total_conversions: number;
  channels: AttributionChannel[];
}

export interface ModelComparison {
  date_from: string;
  date_to: string;
  models: Record<string, Record<string, {
    revenue: number;
    conversions: number;
    roas: number;
  }>>;
}

export interface ConversionPath {
  path: string;
  conversions: number;
  revenue: number;
  share: number;
}

export function useAttribution(
  dateFrom?: string,
  dateTo?: string,
  model: AttributionModel = "linear",
  lookbackDays: number = 30,
) {
  return useQuery<AttributionReport>({
    queryKey: ["attribution", dateFrom, dateTo, model, lookbackDays],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("model", model);
      params.set("lookback_days", String(lookbackDays));
      
      const result = await apiFetch(`/metrics/attribution?${params}`);
      return result as AttributionReport;
    },
  });
}

export function useAttributionComparison(
  dateFrom?: string,
  dateTo?: string,
) {
  return useQuery<ModelComparison>({
    queryKey: ["attribution-comparison", dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      
      const result = await apiFetch(`/metrics/attribution/compare?${params}`);
      return result as ModelComparison;
    },
  });
}

export function useConversionPaths(
  dateFrom?: string,
  dateTo?: string,
  limit: number = 20,
) {
  return useQuery<ConversionPath[]>({
    queryKey: ["conversion-paths", dateFrom, dateTo, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("limit", String(limit));
      
      const result = await apiFetch(`/metrics/attribution/paths?${params}`);
      return result as ConversionPath[];
    },
  });
}

export const ATTRIBUTION_MODELS: { value: AttributionModel; label: string; description: string }[] = [
  { value: "first_touch", label: "First Touch", description: "100% credit to the first touchpoint" },
  { value: "last_touch", label: "Last Touch", description: "100% credit to the last touchpoint" },
  { value: "linear", label: "Linear", description: "Equal credit to all touchpoints" },
  { value: "time_decay", label: "Time Decay", description: "More credit to recent touchpoints" },
  { value: "position_based", label: "Position Based", description: "40% first, 40% last, 20% middle" },
];
