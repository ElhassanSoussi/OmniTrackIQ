"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { formatErrorMessage } from "@/lib/format";

export type IntegrationPlatform = "facebook" | "google_ads" | "tiktok" | "shopify" | "ga4";
export type IntegrationStatus = "connected" | "disconnected" | "error";

export interface IntegrationItem {
  platform: IntegrationPlatform;
  status: IntegrationStatus;
  connected_at?: string;
  account_name?: string;
}

const BASE_INTEGRATIONS: IntegrationItem[] = [
  { platform: "facebook", status: "disconnected" },
  { platform: "google_ads", status: "disconnected" },
  { platform: "tiktok", status: "disconnected" },
  { platform: "shopify", status: "disconnected" },
  { platform: "ga4", status: "disconnected" },
];

export function useIntegrations() {
  const [connecting, setConnecting] = useState<IntegrationPlatform | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, refetch, isLoading, error, isError } = useQuery<IntegrationItem[]>({
    queryKey: ["integrations"],
    queryFn: async () => {
      const response = await apiFetch<IntegrationItem[] | { integrations: IntegrationItem[] }>("/integrations");
      const items = Array.isArray(response) ? response : response?.integrations || [];

      return BASE_INTEGRATIONS.map((base) => {
        const match = items.find((item) => item.platform === base.platform);
        return match ? { ...base, ...match } : base;
      }) as IntegrationItem[];
    },
    retry: false,
  });

  const integrations = useMemo(() => data || BASE_INTEGRATIONS, [data]);

  async function connect(platform: IntegrationPlatform) {
    setActionError(null);
    setConnecting(platform);
    try {
      const result = await apiFetch<{ url: string }>(`/integrations/${platform}/connect-url`);
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      const message = formatErrorMessage(err);
      setActionError(message);
      // Re-throw so the calling component can handle specific errors
      throw new Error(message);
    } finally {
      setConnecting(null);
    }
  }

  return {
    integrations,
    connect,
    reload: refetch,
    isLoading,
    isError,
    error: error as Error | null,
    connecting,
    actionError,
  };
}
