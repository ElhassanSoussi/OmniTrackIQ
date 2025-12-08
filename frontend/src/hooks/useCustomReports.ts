import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// Types
export type VisualizationType = "table" | "line_chart" | "bar_chart" | "pie_chart" | "area_chart" | "metric_cards";

export type MetricType = 
  | "revenue" 
  | "spend" 
  | "profit" 
  | "roas" 
  | "impressions" 
  | "clicks" 
  | "conversions" 
  | "ctr" 
  | "cpc" 
  | "cpa" 
  | "aov" 
  | "orders";

export type DimensionType = 
  | "date" 
  | "platform" 
  | "campaign" 
  | "utm_source" 
  | "utm_campaign" 
  | "utm_medium";

export type FilterOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "in";

export interface ReportFilter {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface ReportConfig {
  metrics: MetricType[];
  dimensions: DimensionType[];
  filters: ReportFilter[];
  date_range: string;
  custom_date_from?: string;
  custom_date_to?: string;
  sort_by?: string;
  sort_direction: "asc" | "desc";
  limit: number;
  compare_previous_period: boolean;
}

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  config: ReportConfig;
  visualization_type: VisualizationType;
  is_shared: boolean;
  is_favorite: boolean;
  last_run_at?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
}

export interface CustomReportListResponse {
  items: CustomReport[];
  total: number;
}

export interface ReportResults {
  report_id: string;
  data: Record<string, unknown>[];
  summary: Record<string, number>;
  total_rows: number;
  executed_at: string;
  comparison_data?: Record<string, unknown>[];
  comparison_summary?: Record<string, number>;
}

export interface MetricMetadata {
  id: string;
  label: string;
  format: "currency" | "number" | "percent" | "decimal";
  description: string;
}

export interface DimensionMetadata {
  id: string;
  label: string;
  description: string;
}

export interface ReportMetadata {
  metrics: MetricMetadata[];
  dimensions: DimensionMetadata[];
}

export interface CreateCustomReportData {
  name: string;
  description?: string;
  config?: ReportConfig;
  visualization_type?: VisualizationType;
  is_shared?: boolean;
  is_favorite?: boolean;
}

export interface UpdateCustomReportData {
  name?: string;
  description?: string;
  config?: ReportConfig;
  visualization_type?: VisualizationType;
  is_shared?: boolean;
  is_favorite?: boolean;
}

// Default config
export const DEFAULT_REPORT_CONFIG: ReportConfig = {
  metrics: ["revenue", "spend", "roas"],
  dimensions: ["date"],
  filters: [],
  date_range: "30d",
  sort_by: undefined,
  sort_direction: "desc",
  limit: 100,
  compare_previous_period: false,
};

// Hooks
export function useCustomReports(
  includeShared = true,
  favoritesOnly = false
) {
  return useQuery<CustomReportListResponse>({
    queryKey: ["custom-reports", includeShared, favoritesOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("include_shared", String(includeShared));
      params.set("favorites_only", String(favoritesOnly));
      const result = await apiFetch(`/custom-reports?${params}`);
      return result as CustomReportListResponse;
    },
  });
}

export function useCustomReport(reportId: string | null) {
  return useQuery<CustomReport>({
    queryKey: ["custom-report", reportId],
    queryFn: async () => {
      const result = await apiFetch(`/custom-reports/${reportId}`);
      return result as CustomReport;
    },
    enabled: !!reportId,
  });
}

export function useReportMetadata() {
  return useQuery<ReportMetadata>({
    queryKey: ["report-metadata"],
    queryFn: async () => {
      const result = await apiFetch("/custom-reports/metadata");
      return result as ReportMetadata;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useCreateCustomReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCustomReportData) => {
      const result = await apiFetch("/custom-reports", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result as CustomReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-reports"] });
    },
  });
}

export function useUpdateCustomReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCustomReportData }) => {
      const result = await apiFetch(`/custom-reports/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return result as CustomReport;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["custom-reports"] });
      queryClient.invalidateQueries({ queryKey: ["custom-report", variables.id] });
    },
  });
}

export function useDeleteCustomReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/custom-reports/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-reports"] });
    },
  });
}

export function useDuplicateCustomReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName?: string }) => {
      const params = newName ? `?new_name=${encodeURIComponent(newName)}` : "";
      const result = await apiFetch(`/custom-reports/${id}/duplicate${params}`, {
        method: "POST",
      });
      return result as CustomReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-reports"] });
    },
  });
}

export function useRunReport(reportId: string) {
  return useQuery<ReportResults>({
    queryKey: ["report-results", reportId],
    queryFn: async () => {
      const result = await apiFetch(`/custom-reports/${reportId}/run`, {
        method: "POST",
      });
      return result as ReportResults;
    },
    enabled: false, // Don't run automatically
  });
}

export function usePreviewReport() {
  return useMutation({
    mutationFn: async (config: ReportConfig) => {
      const result = await apiFetch("/custom-reports/preview", {
        method: "POST",
        body: JSON.stringify(config),
      });
      return result as ReportResults;
    },
  });
}

// Helper functions
export function getMetricFormat(metric: MetricType): "currency" | "number" | "percent" | "decimal" {
  const formats: Record<MetricType, "currency" | "number" | "percent" | "decimal"> = {
    revenue: "currency",
    spend: "currency",
    profit: "currency",
    roas: "decimal",
    impressions: "number",
    clicks: "number",
    conversions: "number",
    ctr: "percent",
    cpc: "currency",
    cpa: "currency",
    aov: "currency",
    orders: "number",
  };
  return formats[metric] || "number";
}

export function getMetricLabel(metric: MetricType): string {
  const labels: Record<MetricType, string> = {
    revenue: "Revenue",
    spend: "Ad Spend",
    profit: "Profit",
    roas: "ROAS",
    impressions: "Impressions",
    clicks: "Clicks",
    conversions: "Conversions",
    ctr: "CTR",
    cpc: "CPC",
    cpa: "CPA",
    aov: "AOV",
    orders: "Orders",
  };
  return labels[metric] || metric;
}

export function getDimensionLabel(dimension: DimensionType): string {
  const labels: Record<DimensionType, string> = {
    date: "Date",
    platform: "Platform",
    campaign: "Campaign",
    utm_source: "UTM Source",
    utm_campaign: "UTM Campaign",
    utm_medium: "UTM Medium",
  };
  return labels[dimension] || dimension;
}

export function getVisualizationLabel(type: VisualizationType): string {
  const labels: Record<VisualizationType, string> = {
    table: "Table",
    line_chart: "Line Chart",
    bar_chart: "Bar Chart",
    pie_chart: "Pie Chart",
    area_chart: "Area Chart",
    metric_cards: "Metric Cards",
  };
  return labels[type] || type;
}
