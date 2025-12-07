"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useIntegrations, IntegrationItem, IntegrationPlatform } from "@/hooks/useIntegrations";

const PLATFORM_COPY: Record<IntegrationItem["platform"], { title: string; description: string }> = {
  facebook: { title: "Facebook Ads", description: "Sync ad spend, campaigns, and conversions from Meta." },
  google_ads: { title: "Google Ads", description: "Import search and shopping performance automatically." },
  tiktok: { title: "TikTok Ads", description: "Bring in spend, clicks, and conversions from TikTok." },
  shopify: { title: "Shopify", description: "Stream orders and revenue to power attribution." },
  ga4: { title: "GA4", description: "Connect Google Analytics 4 for web analytics alignment." },
};

export default function IntegrationsPage() {
  const { integrations, connect, connecting, isLoading, isError, error, actionError } = useIntegrations();
  const [comingSoonPlatform, setComingSoonPlatform] = useState<IntegrationPlatform | null>(null);

  const cards = useMemo(() => integrations.map((i) => ({ ...i, ...PLATFORM_COPY[i.platform] })), [integrations]);

  async function handleConnect(platform: IntegrationPlatform) {
    setComingSoonPlatform(null);
    try {
      await connect(platform);
    } catch (err) {
      // Check if it's a "coming soon" / 501 error
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("coming soon") || message.includes("501")) {
        setComingSoonPlatform(platform);
        setTimeout(() => setComingSoonPlatform(null), 4000);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500">Connect your ad platforms and storefront to stream live performance data.</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
          Loading integrations...
        </div>
      )}
      
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load integrations: {error?.message}
        </div>
      )}
      
      {actionError && !comingSoonPlatform && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {actionError}
        </div>
      )}

      {comingSoonPlatform && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <strong>{PLATFORM_COPY[comingSoonPlatform].title}</strong> integration is coming soon! We&apos;re working on it.
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const isConnected = card.status === "connected";
            const isPending = connecting === card.platform;

            return (
              <div
                key={card.platform}
                className="flex h-full flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/integrations/${card.platform}`}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <span className="text-lg font-semibold text-gray-900 hover:text-emerald-600">{card.title}</span>
                    </Link>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isConnected
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isConnected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{card.description}</p>
                  {card.account_name && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      Linked account: <span className="font-medium text-gray-900">{card.account_name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Link 
                    href={`/integrations/${card.platform}`}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    View details →
                  </Link>
                  <button
                    disabled={isConnected || isPending}
                    onClick={() => handleConnect(card.platform)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      isConnected
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                    }`}
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
