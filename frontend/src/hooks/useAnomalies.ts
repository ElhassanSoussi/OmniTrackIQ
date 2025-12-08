import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// Types
export type AnomalyType = "spike" | "drop" | "trend_change" | "zero_value";
export type AnomalySeverity = "low" | "medium" | "high" | "critical";
export type Sensitivity = "low" | "medium" | "high";

export interface AnomalyItem {
  date: string;
  metric: string;
  metric_label: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  value: number;
  expected_value: number;
  z_score?: number;
  deviation_percent: number;
  is_concerning: boolean;
  description: string;
}

export interface AnomalySummary {
  total_anomalies: number;
  concerning_anomalies: number;
  by_severity: Record<string, number>;
  by_metric: Record<string, number>;
  by_type: Record<string, number>;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface AnomalyDetectionResponse {
  anomalies: AnomalyItem[];
  summary: AnomalySummary;
  date_range: DateRange;
  sensitivity: string;
  metrics_analyzed: string[];
  message?: string;
}

export interface AnomalyTimelinePoint {
  date: string;
  count: number;
  concerning: number;
  anomalies: { metric: string; type: string; severity: string }[];
}

export interface AnomalyTrendsResponse {
  timeline: AnomalyTimelinePoint[];
  total_days_with_anomalies: number;
  date_range: DateRange;
}

export interface MetricHealth {
  metric: string;
  label: string;
  current_value: number;
  previous_value: number;
  change_percent: number;
  status: "stable" | "improving" | "declining" | "critical";
  status_color: "green" | "yellow" | "red";
  trend: "up" | "down" | "flat";
}

export interface MetricHealthResponse {
  metrics: MetricHealth[];
  overall_health: string;
  date_range: DateRange;
  message?: string;
}

export interface AnomalyMetadata {
  metrics: { id: string; label: string; format: string }[];
  severity_levels: string[];
  anomaly_types: string[];
  sensitivity_levels: string[];
}

// Hooks

export function useAnomalyMetadata() {
  return useQuery<AnomalyMetadata>({
    queryKey: ["anomaly-metadata"],
    queryFn: async () => {
      const result = await apiFetch("/anomalies/metadata");
      return result as AnomalyMetadata;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useAnomalyDetection(
  dateFrom?: string,
  dateTo?: string,
  metrics?: string[],
  platform?: string,
  sensitivity: Sensitivity = "medium",
) {
  return useQuery<AnomalyDetectionResponse>({
    queryKey: ["anomalies", dateFrom, dateTo, metrics, platform, sensitivity],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (platform) params.set("platform", platform);
      params.set("sensitivity", sensitivity);
      if (metrics && metrics.length > 0) {
        metrics.forEach((m) => params.append("metrics", m));
      }
      
      const result = await apiFetch(`/anomalies?${params}`);
      return result as AnomalyDetectionResponse;
    },
  });
}

export function useAnomalyTrends(
  dateFrom?: string,
  dateTo?: string,
  platform?: string,
) {
  return useQuery<AnomalyTrendsResponse>({
    queryKey: ["anomaly-trends", dateFrom, dateTo, platform],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (platform) params.set("platform", platform);
      
      const result = await apiFetch(`/anomalies/trends?${params}`);
      return result as AnomalyTrendsResponse;
    },
  });
}

export function useMetricHealth(
  dateFrom?: string,
  dateTo?: string,
  platform?: string,
) {
  return useQuery<MetricHealthResponse>({
    queryKey: ["metric-health", dateFrom, dateTo, platform],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (platform) params.set("platform", platform);
      
      const result = await apiFetch(`/anomalies/health?${params}`);
      return result as MetricHealthResponse;
    },
  });
}

// Utility functions

export function getSeverityColor(severity: AnomalySeverity): string {
  switch (severity) {
    case "critical":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
    case "high":
      return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30";
    case "medium":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
    case "low":
      return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30";
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
  }
}

export function getAnomalyTypeIcon(type: AnomalyType): string {
  switch (type) {
    case "spike":
      return "📈";
    case "drop":
      return "📉";
    case "zero_value":
      return "⚠️";
    case "trend_change":
      return "🔄";
    default:
      return "❓";
  }
}

export function getHealthStatusColor(status: string): string {
  switch (status) {
    case "stable":
    case "improving":
      return "text-emerald-600 dark:text-emerald-400";
    case "declining":
      return "text-yellow-600 dark:text-yellow-400";
    case "critical":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}
