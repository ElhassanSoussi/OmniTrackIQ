import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type ReportFrequency = "daily" | "weekly" | "monthly";
export type ReportType = "overview" | "campaigns" | "revenue" | "orders" | "custom";

export interface ScheduledReport {
  id: string;
  name: string;
  report_type: ReportType;
  frequency: ReportFrequency;
  recipients: string[];
  date_range_days: string;
  platforms: string[];
  metrics: string[];
  is_active: boolean;
  send_time: string;
  timezone: string;
  day_of_week?: string;
  day_of_month?: string;
  last_sent_at?: string;
  next_send_at?: string;
  send_count: number;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface ScheduledReportsResponse {
  items: ScheduledReport[];
  total: number;
}

export interface CreateScheduledReportData {
  name: string;
  report_type?: ReportType;
  frequency?: ReportFrequency;
  recipients: string[];
  date_range_days?: string;
  platforms?: string[];
  metrics?: string[];
  send_time?: string;
  timezone?: string;
  day_of_week?: string;
  day_of_month?: string;
}

export interface UpdateScheduledReportData {
  name?: string;
  report_type?: ReportType;
  frequency?: ReportFrequency;
  recipients?: string[];
  date_range_days?: string;
  platforms?: string[];
  metrics?: string[];
  is_active?: boolean;
  send_time?: string;
  timezone?: string;
  day_of_week?: string;
  day_of_month?: string;
}

export interface ReportOptions {
  frequencies: { value: string; label: string }[];
  report_types: { value: string; label: string }[];
  days_of_week: { value: string; label: string }[];
  timezones: string[];
}

// Fetch all scheduled reports
export function useScheduledReports(isActive?: boolean) {
  return useQuery<ScheduledReportsResponse>({
    queryKey: ["scheduled-reports", isActive],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isActive !== undefined) params.set("is_active", String(isActive));
      const result = await apiFetch(`/scheduled-reports?${params}`);
      return result as ScheduledReportsResponse;
    },
  });
}

// Fetch a single scheduled report
export function useScheduledReport(reportId: string | null) {
  return useQuery<ScheduledReport>({
    queryKey: ["scheduled-report", reportId],
    queryFn: async () => {
      const result = await apiFetch(`/scheduled-reports/${reportId}`);
      return result as ScheduledReport;
    },
    enabled: !!reportId,
  });
}

// Fetch report configuration options
export function useReportOptions() {
  return useQuery<ReportOptions>({
    queryKey: ["report-options"],
    queryFn: async () => {
      const result = await apiFetch(`/scheduled-reports/types/options`);
      return result as ReportOptions;
    },
    staleTime: 1000 * 60 * 60, // 1 hour - these options don't change often
  });
}

// Create a new scheduled report
export function useCreateScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateScheduledReportData) => {
      const result = await apiFetch("/scheduled-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return result as ScheduledReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
    },
  });
}

// Update an existing scheduled report
export function useUpdateScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateScheduledReportData }) => {
      const result = await apiFetch(`/scheduled-reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return result as ScheduledReport;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-report", id] });
    },
  });
}

// Delete a scheduled report
export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/scheduled-reports/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
    },
  });
}

// Toggle report active status
export function useToggleScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await apiFetch(`/scheduled-reports/${id}/toggle`, {
        method: "POST",
      });
      return result as ScheduledReport;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-report", id] });
    },
  });
}

// Send test report
export function useSendTestReport() {
  return useMutation({
    mutationFn: async ({ id, email }: { id: string; email: string }) => {
      const result = await apiFetch(`/scheduled-reports/${id}/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return result as { message: string; report_id: string; email: string };
    },
  });
}
