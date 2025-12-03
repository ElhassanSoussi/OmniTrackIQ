"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useMetrics(from: string, to: string) {
  return useQuery({
    queryKey: ["summary", from, to],
    queryFn: () => apiClient(`/metrics/summary?from=${from}&to=${to}`),
  });
}
