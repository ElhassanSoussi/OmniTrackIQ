"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export function useMetrics(from: string, to: string) {
  return useQuery({
    queryKey: ["summary", from, to],
    enabled: Boolean(from && to),
    queryFn: () => apiFetch(`/metrics/summary?from=${from}&to=${to}`),
    retry: false,
  });
}
