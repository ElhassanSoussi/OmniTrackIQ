"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// Type for campaigns response
interface CampaignsResponse {
  items?: any[];
  [key: string]: any;
}

export function useCampaigns(from: string, to: string): UseQueryResult<CampaignsResponse | undefined, Error> {
  return useQuery<CampaignsResponse | undefined, Error>({
    queryKey: ["campaigns", from, to],
    enabled: Boolean(from && to),
    queryFn: () => apiFetch<CampaignsResponse>(`/metrics/campaigns?from=${from}&to=${to}`),
    retry: false,
  });
}
