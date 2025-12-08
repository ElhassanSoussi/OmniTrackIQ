import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type CohortPeriod = "daily" | "weekly" | "monthly";

export interface CohortPeriodData {
  period: number;
  active_customers: number;
  retention_rate: number;
  revenue: number;
  orders: number;
  cumulative_revenue?: number;
  revenue_per_customer?: number;
}

export interface Cohort {
  cohort: string;
  cohort_size: number;
  periods: CohortPeriodData[];
  estimated_ltv?: number;
}

export interface RetentionCohortsResponse {
  period_type: string;
  date_from: string;
  date_to: string;
  total_customers: number;
  cohorts: Cohort[];
  avg_retention: { period: number; avg_retention_rate: number }[];
  avg_ltv?: { period: number; avg_ltv: number }[];
  report_type?: string;
}

export interface ChannelCohort {
  cohort: string;
  total_customers: number;
  returning_customers: number;
  retention_rate: number;
  total_revenue: number;
  avg_ltv: number;
}

export interface ChannelCohortsResponse {
  period_type: string;
  date_from: string;
  date_to: string;
  channels: {
    channel: string;
    cohorts: ChannelCohort[];
    total_customers: number;
    avg_retention: number;
  }[];
}

export function useRetentionCohorts(
  dateFrom?: string,
  dateTo?: string,
  period: CohortPeriod = "monthly",
  maxPeriods: number = 12,
) {
  return useQuery<RetentionCohortsResponse>({
    queryKey: ["cohorts-retention", dateFrom, dateTo, period, maxPeriods],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("period", period);
      params.set("max_periods", String(maxPeriods));
      
      const result = await apiFetch(`/metrics/cohorts/retention?${params}`);
      return result as RetentionCohortsResponse;
    },
  });
}

export function useRevenueCohorts(
  dateFrom?: string,
  dateTo?: string,
  period: CohortPeriod = "monthly",
  maxPeriods: number = 12,
) {
  return useQuery<RetentionCohortsResponse>({
    queryKey: ["cohorts-revenue", dateFrom, dateTo, period, maxPeriods],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("period", period);
      params.set("max_periods", String(maxPeriods));
      
      const result = await apiFetch(`/metrics/cohorts/revenue?${params}`);
      return result as RetentionCohortsResponse;
    },
  });
}

export function useChannelCohorts(
  dateFrom?: string,
  dateTo?: string,
  period: CohortPeriod = "monthly",
) {
  return useQuery<ChannelCohortsResponse>({
    queryKey: ["cohorts-channel", dateFrom, dateTo, period],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("period", period);
      
      const result = await apiFetch(`/metrics/cohorts/by-channel?${params}`);
      return result as ChannelCohortsResponse;
    },
  });
}
