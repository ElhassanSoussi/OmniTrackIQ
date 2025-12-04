"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useCampaigns(from: string, to: string) {
  return useQuery({
    queryKey: ["campaigns", from, to],
    enabled: Boolean(from && to),
    queryFn: () => apiClient(`/metrics/campaigns?from=${from}&to=${to}`),
    retry: false,
  });
}
