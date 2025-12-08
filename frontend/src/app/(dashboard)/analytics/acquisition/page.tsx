"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { getDateRange, DateRangeValue } from "@/lib/date-range";
import { formatCurrency, formatNumber } from "@/lib/format";
import { MetricTooltip } from "@/components/ui/metric-tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { useSampleDataStats, useGenerateSampleData } from "@/hooks/useSampleData";

interface PlatformData {
  platform: string;
  spend: number;
  spend_percentage: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

interface DailyData {
  date: string;
  clicks?: number;
  impressions?: number;
  conversions?: number;
}

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  facebook: { bg: "bg-blue-500", text: "text-blue-600" },
  google_ads: { bg: "bg-red-500", text: "text-red-600" },
  tiktok: { bg: "bg-gray-900", text: "text-gray-900" },
  snapchat: { bg: "bg-yellow-400", text: "text-yellow-600" },
  pinterest: { bg: "bg-red-600", text: "text-red-700" },
  linkedin: { bg: "bg-blue-700", text: "text-blue-700" },
  organic: { bg: "bg-green-500", text: "text-green-600" },
  direct: { bg: "bg-purple-500", text: "text-purple-600" },
  email: { bg: "bg-orange-500", text: "text-orange-600" },
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook Ads",
  google_ads: "Google Ads",
  tiktok: "TikTok Ads",
  snapchat: "Snapchat Ads",
  pinterest: "Pinterest Ads",
  linkedin: "LinkedIn Ads",
  organic: "Organic Search",
  direct: "Direct Traffic",
  email: "Email Marketing",
};

export default function AcquisitionPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const { from, to } = getDateRange(range);

  const { data: platformData, isLoading: platformLoading } = useQuery<PlatformData[]>({
    queryKey: ["platform-breakdown", from, to],
    queryFn: () => apiFetch(`/metrics/breakdown/platform?from=${from}&to=${to}`) as Promise<PlatformData[]>,
  });

  const { data: dailyClicks, isLoading: dailyLoading } = useQuery<DailyData[]>({
    queryKey: ["daily-clicks", from, to],
    queryFn: () => apiFetch(`/metrics/daily?from=${from}&to=${to}&metrics=clicks&metrics=impressions&metrics=conversions`) as Promise<DailyData[]>,
  });

  const { data: sampleDataStats } = useSampleDataStats();
  const generateSampleData = useGenerateSampleData();

  // Calculate totals and averages
  const totals = useMemo(() => {
    if (!platformData) return { impressions: 0, clicks: 0, conversions: 0, spend: 0, ctr: 0, cvr: 0 };
    const impressions = platformData.reduce((sum, p) => sum + p.impressions, 0);
    const clicks = platformData.reduce((sum, p) => sum + p.clicks, 0);
    const conversions = platformData.reduce((sum, p) => sum + p.conversions, 0);
    const spend = platformData.reduce((sum, p) => sum + p.spend, 0);
    return {
      impressions,
      clicks,
      conversions,
      spend,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cvr: clicks > 0 ? (conversions / clicks) * 100 : 0,
    };
  }, [platformData]);

  // Channel funnel data
  const funnelData = useMemo(() => {
    if (!platformData) return [];
    return platformData.map((p) => ({
      ...p,
      conversionRate: p.clicks > 0 ? ((p.conversions / p.clicks) * 100).toFixed(2) : "0.00",
      costPerConversion: p.conversions > 0 ? p.spend / p.conversions : 0,
    }));
  }, [platformData]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/analytics" className="hover:text-emerald-600">Analytics</Link>
            <span>/</span>
            <span className="text-gray-900">Acquisition</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Acquisition Report</h1>
          <p className="mt-1 text-gray-500">Traffic sources, channels, and customer acquisition metrics</p>
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
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-50 p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-500">Impressions</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {platformLoading ? "..." : formatNumber(totals.impressions)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-2">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-500">Clicks</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {platformLoading ? "..." : formatNumber(totals.clicks)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-50 p-2">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-500">Conversions</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {platformLoading ? "..." : formatNumber(totals.conversions)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-orange-50 p-2">
              <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-500">CTR</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {platformLoading ? "..." : `${totals.ctr.toFixed(2)}%`}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-pink-50 p-2">
              <svg className="h-5 w-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-500">Conv. Rate</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {platformLoading ? "..." : `${totals.cvr.toFixed(2)}%`}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Channel Breakdown Table */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Traffic by Channel</h2>
          <p className="mt-1 text-sm text-gray-500">Performance breakdown across all acquisition channels</p>
          
          {platformLoading ? (
            <div className="mt-6 animate-pulse space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded bg-gray-100" />
              ))}
            </div>
          ) : funnelData && funnelData.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">Channel</th>
                    <th className="pb-3 font-medium text-right">Impressions</th>
                    <th className="pb-3 font-medium text-right">Clicks</th>
                    <th className="pb-3 font-medium text-right">CTR</th>
                    <th className="pb-3 font-medium text-right">Conversions</th>
                    <th className="pb-3 font-medium text-right">Conv. Rate</th>
                    <th className="pb-3 font-medium text-right">Spend</th>
                    <th className="pb-3 font-medium text-right">CPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {funnelData.map((channel) => (
                    <tr key={channel.platform} className="hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${PLATFORM_COLORS[channel.platform]?.bg || "bg-gray-400"}`} />
                          <span className="font-medium text-gray-900">
                            {PLATFORM_LABELS[channel.platform] || channel.platform}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-gray-600">{formatNumber(channel.impressions)}</td>
                      <td className="py-4 text-right text-gray-600">{formatNumber(channel.clicks)}</td>
                      <td className="py-4 text-right">
                        <span className={`font-medium ${channel.ctr > 2 ? "text-emerald-600" : channel.ctr > 1 ? "text-yellow-600" : "text-gray-600"}`}>
                          {channel.ctr.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-4 text-right text-gray-600">{formatNumber(channel.conversions)}</td>
                      <td className="py-4 text-right">
                        <span className={`font-medium ${Number(channel.conversionRate) > 5 ? "text-emerald-600" : Number(channel.conversionRate) > 2 ? "text-yellow-600" : "text-gray-600"}`}>
                          {channel.conversionRate}%
                        </span>
                      </td>
                      <td className="py-4 text-right text-gray-600">{formatCurrency(channel.spend)}</td>
                      <td className="py-4 text-right">
                        <span className={`font-medium ${channel.costPerConversion < 20 ? "text-emerald-600" : channel.costPerConversion < 50 ? "text-yellow-600" : "text-red-600"}`}>
                          {formatCurrency(channel.costPerConversion)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 rounded-lg bg-gray-50 p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-gray-600">No acquisition data available</p>
              <p className="mt-1 text-sm text-gray-500">Connect your ad platforms to see traffic sources</p>
              <Link href="/integrations" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                Connect Integrations
              </Link>
            </div>
          )}
        </div>

        {/* Traffic Trend Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Daily Traffic Trend</h2>
          <p className="mt-1 text-sm text-gray-500">Clicks over time</p>
          
          {dailyLoading ? (
            <div className="mt-6 h-48 animate-pulse rounded bg-gray-100" />
          ) : dailyClicks && dailyClicks.length > 0 ? (
            <div className="mt-6">
              <div className="flex h-48 items-end gap-1">
                {dailyClicks.slice(-30).map((day) => {
                  const maxClicks = Math.max(...dailyClicks.map((d) => d.clicks || 0)) || 1;
                  const height = ((day.clicks || 0) / maxClicks) * 100;
                  return (
                    <div
                      key={day.date}
                      className="group relative flex-1 min-w-[4px]"
                    >
                      <div
                        className="w-full rounded-t bg-emerald-500 transition-colors hover:bg-emerald-600"
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block z-10">
                        {day.date}: {formatNumber(day.clicks || 0)} clicks
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{dailyClicks[0]?.date}</span>
                <span>{dailyClicks[dailyClicks.length - 1]?.date}</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 h-48 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
              <p>No traffic data available</p>
            </div>
          )}
        </div>

        {/* Conversion Trend Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Daily Conversions</h2>
          <p className="mt-1 text-sm text-gray-500">Conversions over time</p>
          
          {dailyLoading ? (
            <div className="mt-6 h-48 animate-pulse rounded bg-gray-100" />
          ) : dailyClicks && dailyClicks.length > 0 ? (
            <div className="mt-6">
              <div className="flex h-48 items-end gap-1">
                {dailyClicks.slice(-30).map((day) => {
                  const maxConv = Math.max(...dailyClicks.map((d) => d.conversions || 0)) || 1;
                  const height = ((day.conversions || 0) / maxConv) * 100;
                  return (
                    <div
                      key={day.date}
                      className="group relative flex-1 min-w-[4px]"
                    >
                      <div
                        className="w-full rounded-t bg-purple-500 transition-colors hover:bg-purple-600"
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block z-10">
                        {day.date}: {formatNumber(day.conversions || 0)} conversions
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{dailyClicks[0]?.date}</span>
                <span>{dailyClicks[dailyClicks.length - 1]?.date}</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 h-48 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
              <p>No conversion data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Channel Efficiency Matrix */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Channel Efficiency Matrix</h2>
        <p className="mt-1 text-sm text-gray-500">Spend efficiency vs. volume by channel</p>
        
        {platformLoading ? (
          <div className="mt-6 h-64 animate-pulse rounded bg-gray-100" />
        ) : funnelData && funnelData.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {funnelData.map((channel) => {
              const efficiency = channel.clicks > 0 ? (channel.conversions / channel.clicks) * 100 : 0;
              const efficiencyLevel = efficiency > 5 ? "High" : efficiency > 2 ? "Medium" : "Low";
              const efficiencyColor = efficiency > 5 ? "text-emerald-600 bg-emerald-50" : efficiency > 2 ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50";
              
              return (
                <div key={channel.platform} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${PLATFORM_COLORS[channel.platform]?.bg || "bg-gray-400"}`} />
                      <span className="font-medium text-gray-900 text-sm">
                        {PLATFORM_LABELS[channel.platform] || channel.platform}
                      </span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${efficiencyColor}`}>
                      {efficiencyLevel}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">CPC</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(channel.cpc)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">CPA</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(channel.costPerConversion)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Volume</p>
                      <p className="font-semibold text-gray-900">{formatNumber(channel.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conv.</p>
                      <p className="font-semibold text-gray-900">{formatNumber(channel.conversions)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 h-64 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
            <p>No channel data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
