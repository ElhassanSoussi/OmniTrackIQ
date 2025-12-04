"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useIntegrations() {
  const { data, refetch, isLoading, error, isError } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => apiClient("/integrations"),
    retry: false,
  });

  async function connect(platform: string) {
    const { url } = await apiClient(`/integrations/${platform}/connect-url`);
    window.location.href = url;
  }

  return {
    integrations: data || [],
    connect,
    reload: refetch,
    isLoading,
    isError,
    error: error as Error | null,
  };
}
