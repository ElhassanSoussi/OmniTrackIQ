"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useIntegrations, IntegrationPlatform, IntegrationItem } from "@/hooks/useIntegrations";

// Integration metadata with detailed information
const INTEGRATION_INFO: Record<IntegrationPlatform, {
  title: string;
  description: string;
  features: string[];
  docsUrl: string;
  setupSteps: string[];
}> = {
  facebook: {
    title: "Facebook Ads",
    description: "Connect your Meta Business account to sync ad spend, campaigns, ad sets, and conversion data from Facebook and Instagram ads.",
    features: [
      "Real-time ad spend tracking",
      "Campaign and ad set performance metrics",
      "Conversion and ROAS attribution",
      "Audience insights integration",
      "Automated budget alerts",
    ],
    docsUrl: "https://developers.facebook.com/docs/marketing-apis",
    setupSteps: [
      "Click Connect to authorize with Facebook",
      "Select the ad accounts you want to sync",
      "Choose the data attribution window",
      "Confirm and start syncing",
    ],
  },
  google_ads: {
    title: "Google Ads",
    description: "Import search, display, shopping, and YouTube advertising performance automatically from your Google Ads accounts.",
    features: [
      "Search and shopping campaign metrics",
      "Display and YouTube ad performance",
      "Keyword-level conversion data",
      "Smart bidding performance insights",
      "Cross-account reporting (MCC support)",
    ],
    docsUrl: "https://developers.google.com/google-ads/api",
    setupSteps: [
      "Click Connect to authorize with Google",
      "Select the Google Ads accounts to sync",
      "Configure conversion tracking settings",
      "Enable automatic data refresh",
    ],
  },
  tiktok: {
    title: "TikTok Ads",
    description: "Bring in spend, clicks, impressions, and conversions from TikTok Ads Manager to understand your short-form video ad performance.",
    features: [
      "Campaign and ad group performance",
      "Creative-level analytics",
      "Conversion tracking via TikTok Pixel",
      "Audience demographics and reach",
      "Cost per result optimization",
    ],
    docsUrl: "https://ads.tiktok.com/marketing_api",
    setupSteps: [
      "Click Connect to authorize with TikTok",
      "Select your TikTok Business Center",
      "Choose the ad accounts to sync",
      "Configure pixel event mapping",
    ],
  },
  shopify: {
    title: "Shopify",
    description: "Stream orders, revenue, refunds, and customer data from your Shopify store to power accurate attribution and ROAS calculations.",
    features: [
      "Real-time order and revenue sync",
      "Refund and cancellation tracking",
      "Customer lifetime value (CLV) data",
      "Product and variant performance",
      "Discount and promo code attribution",
    ],
    docsUrl: "https://shopify.dev/docs/api",
    setupSteps: [
      "Click Connect to authorize with Shopify",
      "Select your Shopify store",
      "Grant order and customer data permissions",
      "Configure historical data import range",
    ],
  },
  ga4: {
    title: "Google Analytics 4",
    description: "Connect Google Analytics 4 to align web analytics data with your advertising and commerce metrics for full-funnel visibility.",
    features: [
      "Session and user metrics alignment",
      "Event and conversion tracking",
      "Traffic source attribution",
      "Engagement metrics correlation",
      "Custom dimension mapping",
    ],
    docsUrl: "https://developers.google.com/analytics/devguides/reporting/data/v1",
    setupSteps: [
      "Click Connect to authorize with Google",
      "Select your GA4 property",
      "Map events to conversion goals",
      "Configure data stream settings",
    ],
  },
};

export default function IntegrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const provider = params.provider as string;

  const { integrations, connect, connecting, isLoading, actionError } = useIntegrations();

  const [disconnecting, setDisconnecting] = useState(false);
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);

  // Validate provider
  const validPlatforms: IntegrationPlatform[] = ["facebook", "google_ads", "tiktok", "shopify", "ga4"];
  const isValidProvider = validPlatforms.includes(provider as IntegrationPlatform);

  const platform = provider as IntegrationPlatform;
  const info = INTEGRATION_INFO[platform];
  const integration = useMemo(
    () => integrations.find((i) => i.platform === platform),
    [integrations, platform]
  );

  useEffect(() => {
    if (!isValidProvider && !isLoading) {
      router.replace("/integrations");
    }
  }, [isValidProvider, isLoading, router]);

  if (!isValidProvider || !info) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">Integration not found</h1>
          <p className="text-gray-500 mt-2">Redirecting to integrations page...</p>
        </div>
      </div>
    );
  }

  const isConnected = integration?.status === "connected";
  const isPending = connecting === platform;

  async function handleConnect() {
    setComingSoonMessage(null);
    try {
      await connect(platform);
    } catch (err: any) {
      // Check if this is a "coming soon" error from backend (501)
      if (err?.message?.toLowerCase().includes("coming soon")) {
        setComingSoonMessage(err.message);
      }
      // Other errors are handled by actionError from the hook
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    // This would call an API to disconnect - placeholder for now
    setTimeout(() => {
      setDisconnecting(false);
      alert("Disconnect functionality coming soon!");
    }, 1000);
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/integrations" className="text-gray-500 hover:text-gray-700">
          Integrations
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{info.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{info.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isConnected
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {isConnected ? "Connected" : "Not connected"}
            </span>
            {integration?.connected_at && (
              <span className="text-sm text-gray-500">
                Connected {new Date(integration.connected_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {isConnected ? (
            <>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
              <button
                onClick={handleConnect}
                disabled={isPending}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isPending ? "Reconnecting..." : "Reconnect"}
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPending ? "Connecting..." : "Connect"}
            </button>
          )}
        </div>
      </div>

      {/* Coming soon toast */}
      {comingSoonMessage && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 flex items-center justify-between">
          <span>{comingSoonMessage}</span>
          <button
            onClick={() => setComingSoonMessage(null)}
            className="ml-4 text-blue-500 hover:text-blue-700 font-medium"
          >
            ✕
          </button>
        </div>
      )}

      {actionError && !comingSoonMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Account info */}
      {integration?.account_name && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-700">Connected account</div>
          <div className="text-lg font-semibold text-gray-900 mt-1">{integration.account_name}</div>
        </div>
      )}

      {/* Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">About this integration</h2>
        <p className="text-gray-600 mt-2">{info.description}</p>
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Features */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Features</h2>
          <ul className="mt-4 space-y-3">
            {info.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs">
                  ✓
                </span>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Setup steps */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Setup steps</h2>
          <ol className="mt-4 space-y-3">
            {info.setupSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Documentation link */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Need help?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Check out the official API documentation for troubleshooting and advanced configuration.
            </p>
          </div>
          <a
            href={info.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            View docs
            <span className="text-gray-400">↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
