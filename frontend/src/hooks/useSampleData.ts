import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

interface SampleDataStats {
  has_sample_data: boolean;
  ad_spend_records: number;
  order_records: number;
}

interface SampleDataResponse {
  message: string;
  ad_spend_records: number;
  order_records: number;
}

async function fetchSampleDataStats(): Promise<SampleDataStats> {
  const result = await apiFetch<SampleDataStats>("/sample-data/stats");
  if (!result) {
    throw new Error("Failed to fetch sample data stats");
  }
  return result;
}

async function generateSampleData(): Promise<SampleDataResponse> {
  const result = await apiFetch<SampleDataResponse>("/sample-data/generate", {
    method: "POST",
  });
  if (!result) {
    throw new Error("Failed to generate sample data");
  }
  return result;
}

async function deleteSampleData(): Promise<SampleDataResponse> {
  const result = await apiFetch<SampleDataResponse>("/sample-data", {
    method: "DELETE",
  });
  if (!result) {
    throw new Error("Failed to delete sample data");
  }
  return result;
}

export function useSampleDataStats() {
  return useQuery({
    queryKey: ["sampleDataStats"],
    queryFn: fetchSampleDataStats,
    staleTime: 30000,
  });
}

export function useGenerateSampleData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateSampleData,
    onSuccess: () => {
      // Invalidate sample data stats and all analytics queries
      queryClient.invalidateQueries({ queryKey: ["sampleDataStats"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["adSpend"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });
}

export function useDeleteSampleData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSampleData,
    onSuccess: () => {
      // Invalidate sample data stats and all analytics queries
      queryClient.invalidateQueries({ queryKey: ["sampleDataStats"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["adSpend"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
