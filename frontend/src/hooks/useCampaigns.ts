"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

type Campaign = {
  [key: string]: any;  // Allow any structure for now
};

export function useCampaigns(from: string, to: string): UseQueryResult<Campaign[] | undefined> {
  return useQuery<Campaign[] | undefined>({
    queryKey: ["campaigns", from, to],
    enabled: Boolean(from && to),
    queryFn: () => apiFetch<Campaign[]>(`/metrics/campaigns?from=${from}&to=${to}`),
    retry: false,
  });
}
