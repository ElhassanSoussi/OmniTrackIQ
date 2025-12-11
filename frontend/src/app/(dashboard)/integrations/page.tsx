"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useIntegrations, IntegrationItem, IntegrationPlatform } from "@/hooks/useIntegrations";
import { useBilling } from "@/hooks/useBilling";
import { canAddMoreIntegrations, maxIntegrations, getUpgradeSuggestion } from "@/lib/plan";
import { trackIntegrationConnected } from "@/lib/analytics";

const PLATFORM_COPY: Record<IntegrationItem["platform"], { title: string; description: string }> = {
  facebook: { title: "Facebook Ads", description: "Sync ad spend, campaigns, and conversions from Meta." },
  google_ads: { title: "Google Ads", description: "Import search and shopping performance automatically." },
  tiktok: { title: "TikTok Ads", description: "Bring in spend, clicks, and conversions from TikTok." },
  shopify: { title: "Shopify", description: "Stream orders and revenue to power attribution." },
  ga4: { title: "GA4", description: "Connect Google Analytics 4 for web analytics alignment." },
};

export default function IntegrationsPage() {
  const searchParams = useSearchParams();
  const { integrations, connect, connecting, isLoading, isError, error, actionError, reload } = useIntegrations();
  const { billing } = useBilling();
  const [comingSoonPlatform, setComingSoonPlatform] = useState<IntegrationPlatform | null>(null);
  const [trackedConnection, setTrackedConnection] = useState<string | null>(null);

  // Track successful integration connection from OAuth callback
  useEffect(() => {
    const success = searchParams.get("success");
    const platform = searchParams.get("platform");
    
    if (success === "true" && platform && platform !== trackedConnection) {
      // Track the connection event
      trackIntegrationConnected(
        platform,
        billing?.plan,
        billing?.status === "trialing"
      );
      setTrackedConnection(platform);
      // Reload integrations to show updated status
      reload();
    }
  }, [searchParams, billing?.plan, billing?.status, trackedConnection, reload]);

  const cards = useMemo(() => integrations.map((i) => ({ ...i, ...PLATFORM_COPY[i.platform] })), [integrations]);
  
  // Calculate connected integrations count
  const connectedCount = useMemo(() => 
    integrations.filter((i) => i.status === "connected").length, 
    [integrations]
  );

  // Check if user can add more integrations based on their plan
  const currentPlan = billing?.plan || "free";
  const canConnect = canAddMoreIntegrations(currentPlan, connectedCount);
  const limit = maxIntegrations(currentPlan);
  const upgradeSuggestion = getUpgradeSuggestion(currentPlan);

  async function handleConnect(platform: IntegrationPlatform) {
    setComingSoonPlatform(null);
    try {
      await connect(platform);
    } catch (err) {
      // Check if it's a "coming soon" / 501 error
      const message = err instanceof Error ? err.message : String(err);
      if (
        message.toLowerCase().includes("coming soon") || 
        message.includes("501") ||
        message.toLowerCase().includes("not configured") ||
        message.toLowerCase().includes("additional setup")
      ) {
        setComingSoonPlatform(platform);
        setTimeout(() => setComingSoonPlatform(null), 5000);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Integrations</h1>
        <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Connect your ad platforms and storefront to stream live performance data.</p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-gh-text-secondary dark:text-gh-text-secondary-dark">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
          Loading integrations...
        </div>
      )}
      
      {isError && (
        <div className="rounded-md border border-gh-danger-emphasis bg-gh-danger-subtle px-4 py-3 text-sm text-gh-danger-fg dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          Failed to load integrations: {error?.message}
        </div>
      )}
      
      {actionError && !comingSoonPlatform && (
        <div className="rounded-md border border-gh-attention-emphasis bg-gh-attention-subtle px-4 py-3 text-sm text-gh-attention-fg dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
          {actionError}
        </div>
      )}

      {comingSoonPlatform && (
        <div className="rounded-md border border-gh-accent-emphasis bg-gh-accent-subtle px-4 py-3 text-sm text-gh-accent-fg dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <strong>{PLATFORM_COPY[comingSoonPlatform].title}</strong> integration is coming soon! We&apos;re working on it.
        </div>
      )}

      {/* Plan limit warning */}
      {!canConnect && limit !== -1 && (
        <div className="rounded-md border border-gh-attention-emphasis bg-gh-attention-subtle px-4 py-3 text-sm dark:border-yellow-700 dark:bg-yellow-900/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-gh-attention-fg dark:text-yellow-300">
                Integration limit reached ({connectedCount}/{limit})
              </span>
              {upgradeSuggestion && (
                <p className="mt-1 text-gh-attention-fg dark:text-yellow-400">
                  {upgradeSuggestion.message}
                </p>
              )}
            </div>
            <Link 
              href="/billing"
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      )}

      {/* Current usage indicator */}
      {limit !== -1 && (
        <div className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">
          Using {connectedCount} of {limit} integration{limit !== 1 ? "s" : ""}
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const isConnected = card.status === "connected";
            const isPending = connecting === card.platform;
            const isDisabledByLimit = !isConnected && !canConnect;

            return (
              <div
                key={card.platform}
                className={`flex h-full flex-col justify-between rounded-md border bg-gh-canvas-default p-5 transition dark:bg-gh-canvas-dark ${
                  isDisabledByLimit 
                    ? "border-gh-border opacity-60 dark:border-gh-border-dark" 
                    : "border-gh-border hover:border-gh-border-dark dark:border-gh-border-dark dark:hover:border-gh-border"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/integrations/${card.platform}`}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <span className="text-lg font-semibold text-gh-text-primary hover:text-brand-500 dark:text-gh-text-primary-dark dark:hover:text-brand-400">{card.title}</span>
                    </Link>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isConnected
                          ? "bg-gh-success-subtle text-gh-success-fg dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gh-attention-subtle text-gh-attention-fg dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {isConnected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">{card.description}</p>
                  {card.account_name && (
                    <div className="rounded-md border border-gh-border bg-gh-canvas-subtle px-3 py-2 text-xs text-gh-text-secondary dark:border-gh-border-dark dark:bg-gh-canvas-subtle-dark dark:text-gh-text-secondary-dark">
                      Linked account: <span className="font-medium text-gh-text-primary dark:text-gh-text-primary-dark">{card.account_name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Link 
                    href={`/integrations/${card.platform}`}
                    className="text-xs text-brand-500 hover:text-brand-600 font-medium dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    View details →
                  </Link>
                  {isDisabledByLimit ? (
                    <span 
                      className="rounded-md bg-gh-canvas-subtle px-4 py-2 text-sm font-semibold text-gh-text-tertiary cursor-not-allowed dark:bg-gh-canvas-subtle-dark dark:text-gh-text-tertiary-dark"
                      title={upgradeSuggestion?.message || "Upgrade to connect more integrations"}
                    >
                      Upgrade to Connect
                    </span>
                  ) : (
                    <button
                      disabled={isConnected || isPending}
                      onClick={() => handleConnect(card.platform)}
                      className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                        isConnected
                          ? "bg-gh-canvas-subtle text-gh-text-tertiary cursor-not-allowed dark:bg-gh-canvas-subtle-dark dark:text-gh-text-tertiary-dark"
                          : "bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60"
                      }`}
                    >
                      {isConnected ? "Connected" : isPending ? "Connecting..." : "Connect"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
