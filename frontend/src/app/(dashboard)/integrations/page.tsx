"use client";

import { useIntegrations } from "@/hooks/useIntegrations";

export default function IntegrationsPage() {
  const { integrations, connect, isLoading, isError, error } = useIntegrations();

  const platforms = integrations.length
    ? integrations
    : [
        { platform: "facebook", status: "disconnected" },
        { platform: "shopify", status: "disconnected" },
        { platform: "google_ads", status: "coming soon" },
        { platform: "tiktok", status: "coming soon" },
        { platform: "ga4", status: "coming soon" },
      ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Integrations</h1>
      {isLoading && <div className="text-slate-400">Loading...</div>}
      {isError && <div className="text-sm text-rose-400">Failed to load integrations: {error?.message}</div>}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {platforms.map((int: any) => (
            <div key={int.platform} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-lg font-semibold capitalize text-white">{int.platform.replace("_", " ")}</div>
              <div className="text-sm text-slate-400">Status: {int.status}</div>
              {int.status !== "connected" && int.status !== "coming soon" && (
                <button
                  onClick={() => connect(int.platform)}
                  className="mt-4 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  Connect
                </button>
              )}
              {int.status === "coming soon" && <div className="mt-4 text-xs text-slate-500">Coming soon</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
