"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { getDateRange, DateRangeValue } from "@/lib/date-range";
import { formatCurrency, formatNumber } from "@/lib/format";

interface PlatformBreakdown {
  platform: string;
  spend: number;
  spend_percentage: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

interface TopPerformer {
  rank: number;
  campaign_id: string;
  campaign_name: string;
  platform: string;
  spend: number;
  clicks: number;
  conversions: number;
}

interface DailyData {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-500",
  google_ads: "bg-red-500",
  tiktok: "bg-black",
  snapchat: "bg-yellow-400",
  pinterest: "bg-red-600",
  linkedin: "bg-blue-700",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  google_ads: "Google Ads",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
};

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const { from, to } = getDateRange(range);

  const { data: platformData, isLoading: platformLoading } = useQuery<PlatformBreakdown[]>({
    queryKey: ["platform-breakdown", from, to],
    queryFn: () => apiFetch(`/metrics/breakdown/platform?from=${from}&to=${to}`) as Promise<PlatformBreakdown[]>,
  });

  const { data: topPerformers, isLoading: topLoading } = useQuery<TopPerformer[]>({
    queryKey: ["top-performers", from, to],
    queryFn: () => apiFetch(`/metrics/top-performers?from=${from}&to=${to}&metric=spend&limit=5`) as Promise<TopPerformer[]>,
  });

  const { data: dailyData, isLoading: dailyLoading } = useQuery<DailyData[]>({
    queryKey: ["daily-performance", from, to],
    queryFn: () => apiFetch(`/metrics/daily?from=${from}&to=${to}&metrics=spend&metrics=revenue&metrics=roas`) as Promise<DailyData[]>,
  });

  const totalSpend = useMemo(() => {
    if (!platformData) return 0;
    return platformData.reduce((sum, p) => sum + p.spend, 0);
  }, [platformData]);

  const totalClicks = useMemo(() => {
    if (!platformData) return 0;
    return platformData.reduce((sum, p) => sum + p.clicks, 0);
  }, [platformData]);

  const totalConversions = useMemo(() => {
    if (!platformData) return 0;
    return platformData.reduce((sum, p) => sum + p.conversions, 0);
  }, [platformData]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="mt-1 text-gray-500">Cross-channel performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as DateRangeValue)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            aria-label="Select date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Main Dashboard
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Total Spend</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {platformLoading ? "..." : formatCurrency(totalSpend)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Total Clicks</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {platformLoading ? "..." : formatNumber(totalClicks)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Conversions</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {platformLoading ? "..." : formatNumber(totalConversions)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Avg CPC</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {platformLoading ? "..." : formatCurrency(totalClicks > 0 ? totalSpend / totalClicks : 0)}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Platform Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Spend by Platform</h2>
          <p className="mt-1 text-sm text-gray-500">Where your budget is going</p>
          
          {platformLoading ? (
            <div className="mt-6 animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded bg-gray-200" />
              ))}
            </div>
          ) : platformData && platformData.length > 0 ? (
            <div className="mt-6 space-y-4">
              {platformData.map((platform) => (
                <div key={platform.platform}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">
                      {PLATFORM_LABELS[platform.platform] || platform.platform}
                    </span>
                    <span className="text-gray-600">
                      {formatCurrency(platform.spend)} ({platform.spend_percentage}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full ${PLATFORM_COLORS[platform.platform] || "bg-gray-400"}`}
                      style={{ width: `${platform.spend_percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 flex gap-4 text-xs text-gray-500">
                    <span>{formatNumber(platform.clicks)} clicks</span>
                    <span>{formatNumber(platform.conversions)} conv</span>
                    <span>{platform.ctr}% CTR</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg bg-gray-50 p-8 text-center text-gray-500">
              <p>No platform data available</p>
              <p className="mt-1 text-sm">Connect integrations to see breakdown</p>
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Top Campaigns</h2>
          <p className="mt-1 text-sm text-gray-500">By total spend</p>
          
          {topLoading ? (
            <div className="mt-6 animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded bg-gray-200" />
              ))}
            </div>
          ) : topPerformers && topPerformers.length > 0 ? (
            <div className="mt-6 space-y-3">
              {topPerformers.map((campaign) => (
                <div
                  key={campaign.campaign_id}
                  className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                    {campaign.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-900">{campaign.campaign_name}</p>
                    <p className="text-xs text-gray-500">
                      {PLATFORM_LABELS[campaign.platform] || campaign.platform}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(campaign.spend)}</p>
                    <p className="text-xs text-gray-500">{formatNumber(campaign.clicks)} clicks</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg bg-gray-50 p-8 text-center text-gray-500">
              <p>No campaign data available</p>
              <p className="mt-1 text-sm">Data will appear once synced</p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Daily Performance</h2>
        <p className="mt-1 text-sm text-gray-500">Spend and revenue over time</p>
        
        {dailyLoading ? (
          <div className="mt-6 h-64 animate-pulse rounded bg-gray-200" />
        ) : dailyData && dailyData.length > 0 ? (
          <div className="mt-6">
            {/* Simple bar chart representation */}
            <div className="flex h-48 items-end gap-1">
              {dailyData.slice(-30).map((day, i) => {
                const maxSpend = Math.max(...dailyData.map((d) => d.spend)) || 1;
                const height = (day.spend / maxSpend) * 100;
                return (
                  <div
                    key={day.date}
                    className="group relative flex-1 min-w-[4px]"
                    title={`${day.date}: ${formatCurrency(day.spend)}`}
                  >
                    <div
                      className="w-full rounded-t bg-emerald-500 transition-colors hover:bg-emerald-600"
                      style={{ height: `${height}%` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                      {day.date}
                      <br />
                      Spend: {formatCurrency(day.spend)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{dailyData[0]?.date}</span>
              <span>{dailyData[dailyData.length - 1]?.date}</span>
            </div>
          </div>
        ) : (
          <div className="mt-6 h-48 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
            <p>No daily data available</p>
          </div>
        )}
      </div>

      {/* Links to specific dashboards */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/analytics/acquisition"
          className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-md"
        >
          <h3 className="font-semibold text-gray-900">Acquisition Report</h3>
          <p className="mt-1 text-sm text-gray-500">Traffic sources and customer acquisition</p>
        </Link>
        <Link
          href="/analytics/campaigns"
          className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-md"
        >
          <h3 className="font-semibold text-gray-900">Campaign Performance</h3>
          <p className="mt-1 text-sm text-gray-500">Detailed campaign metrics and ROI</p>
        </Link>
        <Link
          href="/analytics/revenue"
          className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-md"
        >
          <h3 className="font-semibold text-gray-900">Revenue Analysis</h3>
          <p className="mt-1 text-sm text-gray-500">Order attribution and revenue trends</p>
        </Link>
      </div>
    </div>
  );
}
