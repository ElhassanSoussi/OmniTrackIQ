"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export type CampaignMetrics = {
  campaign_name?: string;
  name?: string;
  platform?: string;
  spend?: number;
  revenue?: number;
  roas?: number;
  clicks?: number;
  conversions?: number;
};

export function useCampaigns(from: string, to: string) {
  return useQuery<CampaignMetrics[]>({
    queryKey: ["campaigns", from, to],
    enabled: Boolean(from && to),
    queryFn: async () => {
      const result = await apiFetch<CampaignMetrics[]>(`/metrics/campaigns?from=${from}&to=${to}`);
      return result as CampaignMetrics[];
    },
    retry: false,
  });
}
