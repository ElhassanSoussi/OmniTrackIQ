"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useCampaigns(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  return useQuery({
    queryKey: ["campaigns", from, to],
    queryFn: () => apiClient(`/metrics/campaigns?${params.toString()}`),
  });
}
