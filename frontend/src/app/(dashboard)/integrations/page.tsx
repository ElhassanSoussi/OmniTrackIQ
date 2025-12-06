"use client";

import { useMemo } from "react";
import { useIntegrations, IntegrationItem } from "@/hooks/useIntegrations";

const PLATFORM_COPY: Record<IntegrationItem["platform"], { title: string; description: string }> = {
  facebook: { title: "Facebook Ads", description: "Sync ad spend, campaigns, and conversions from Meta." },
  google_ads: { title: "Google Ads", description: "Import search and shopping performance automatically." },
  tiktok: { title: "TikTok Ads", description: "Bring in spend, clicks, and conversions from TikTok." },
  shopify: { title: "Shopify", description: "Stream orders and revenue to power attribution." },
  ga4: { title: "GA4", description: "Connect Google Analytics 4 for web analytics alignment." },
};

export default function IntegrationsPage() {
  const { integrations, connect, connecting, isLoading, isError, error, actionError } = useIntegrations();

  const cards = useMemo(() => integrations.map((i) => ({ ...i, ...PLATFORM_COPY[i.platform] })), [integrations]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-white">Integrations</h1>
        <p className="text-sm text-slate-400">Connect your ad platforms and storefront to stream live performance data.</p>
      </div>

      {isLoading && <div className="text-slate-400">Loading integrations...</div>}
      {isError && <div className="rounded-lg border border-rose-800/50 bg-rose-900/30 px-4 py-3 text-sm text-rose-200">Failed to load integrations: {error?.message}</div>}
      {actionError && <div className="rounded-lg border border-amber-800/50 bg-amber-900/30 px-4 py-3 text-sm text-amber-100">{actionError}</div>}

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const isConnected = card.status === "connected";
            const isComingSoon = card.status === "coming_soon";
            const isPending = connecting === card.platform;

            return (
              <div
                key={card.platform}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-inner shadow-black/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-white">{card.title}</div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isConnected
                          ? "bg-emerald-500/20 text-emerald-200"
                          : isComingSoon
                          ? "bg-slate-800 text-slate-300"
                          : "bg-amber-500/20 text-amber-100"
                      }`}
                    >
                      {isConnected ? "Connected" : isComingSoon ? "Coming soon" : "Not connected"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{card.description}</p>
                  {card.account_name && (
                    <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
                      Linked account: {card.account_name}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    {card.connected_at ? `Connected on ${new Date(card.connected_at).toLocaleDateString()}` : "OAuth opens in a new tab"}
                  </div>
                  <button
                    disabled={isConnected || isComingSoon || isPending}
                    onClick={() => connect(card.platform)}
                    className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
                  >
                    {isConnected ? "Connected" : isPending ? "Connecting..." : "Connect"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
