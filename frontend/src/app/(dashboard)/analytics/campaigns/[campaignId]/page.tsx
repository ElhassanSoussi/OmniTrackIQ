"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { getDateRange, DateRangeValue } from "@/lib/date-range";
import { formatCurrency, formatNumber } from "@/lib/format";
import { MetricTooltip } from "@/components/ui/metric-tooltip";
import { KPICard } from "@/components/dashboard";

interface CampaignSummary {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  platform_label: string;
  spend: number;
  revenue: number;
  roas: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  status: string;
}

interface DailyDataPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface CampaignDetailResponse {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  summary: CampaignSummary;
  daily: DailyDataPoint[];
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-700",
  google_ads: "bg-red-100 text-red-700",
  tiktok: "bg-gray-100 text-gray-700",
  shopify: "bg-green-100 text-green-700",
};

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.campaignId as string;
  const [range, setRange] = useState<DateRangeValue>("30d");
  const { from, to } = getDateRange(range);

  const { data: campaign, isLoading, isError, error } = useQuery<CampaignDetailResponse | undefined>({
    queryKey: ["campaign-detail", campaignId, from, to],
    enabled: Boolean(campaignId),
    queryFn: async () => {
      const result = await apiFetch<CampaignDetailResponse>(
        `/metrics/campaigns/${encodeURIComponent(campaignId)}?from=${from}&to=${to}`
      );
      return result;
    },
  });

  const maxDailySpend = useMemo(() => {
    if (!campaign?.daily?.length) return 1;
    return Math.max(...campaign.daily.map((d) => d.spend)) || 1;
  }, [campaign]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-gray-200" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-100" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link href="/analytics/campaigns" className="text-sm text-emerald-600 hover:text-emerald-700">
            ← Back to Campaigns
          </Link>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800">Campaign not found</h2>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : "Unable to load campaign details."}
          </p>
        </div>
      </div>
    );
  }

  const { summary, daily } = campaign;
  const platformColor = PLATFORM_COLORS[summary.platform] || "bg-gray-100 text-gray-700";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/analytics/campaigns" className="mb-4 inline-block text-sm text-emerald-600 hover:text-emerald-700">
          ← Back to Campaigns
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{summary.campaign_name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${platformColor}`}>
                {summary.platform_label || summary.platform}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                summary.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}>
                {summary.status}
              </span>
            </div>
            <p className="mt-1 text-gray-500">Campaign ID: {summary.campaign_id}</p>
          </div>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as DateRangeValue)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            aria-label="Date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <KPICard
          label="Spend"
          value={formatCurrency(summary.spend)}
          subtext="Total spend"
          tone="neutral"
        />
        <KPICard
          label="Clicks"
          value={formatNumber(summary.clicks)}
          subtext={`${summary.ctr.toFixed(2)}% CTR`}
          tone="neutral"
        />
        <KPICard
          label="Conversions"
          value={formatNumber(summary.conversions)}
          subtext={`${formatCurrency(summary.cpa)} CPA`}
          tone={summary.conversions > 0 ? "positive" : "neutral"}
        />
        <KPICard
          label="Impressions"
          value={formatNumber(summary.impressions)}
          subtext="Total impressions"
          tone="neutral"
        />
        <KPICard
          label="CPC"
          value={formatCurrency(summary.cpc)}
          subtext="Cost per click"
          tone="neutral"
        />
        <KPICard
          label="CTR"
          value={`${summary.ctr.toFixed(2)}%`}
          subtext="Click-through rate"
          tone={summary.ctr > 1 ? "positive" : "neutral"}
        />
      </div>

      {/* Daily Performance Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Daily Performance</h2>
            <p className="text-sm text-gray-500">Spend and conversions over time</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden />
              Spend
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
              Conversions
            </div>
          </div>
        </div>

        {daily.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="flex h-48 items-end gap-1 min-w-[600px]">
              {daily.map((day) => {
                const spendHeight = (day.spend / maxDailySpend) * 100;
                const maxConversions = Math.max(...daily.map((d) => d.conversions)) || 1;
                const convHeight = (day.conversions / maxConversions) * 100;
                
                return (
                  <div
                    key={day.date}
                    className="flex flex-1 flex-col items-center gap-1 group"
                  >
                    <div className="flex w-full items-end justify-center gap-0.5 h-40">
                      <div
                        className="w-3 rounded-t bg-blue-500 transition-all group-hover:bg-blue-600"
                        style={{ height: `${spendHeight}%` }}
                        title={`Spend: ${formatCurrency(day.spend)}`}
                      />
                      <div
                        className="w-3 rounded-t bg-emerald-500 transition-all group-hover:bg-emerald-600"
                        style={{ height: `${convHeight}%` }}
                        title={`Conversions: ${day.conversions}`}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400 truncate w-full text-center" title={day.date}>
                      {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center text-gray-500">
            No daily data available for this period.
          </div>
        )}
      </div>

      {/* Daily Breakdown Table */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Daily Breakdown</h2>
        </div>
        {daily.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">
                    <MetricTooltip metric="spend">Spend</MetricTooltip>
                  </th>
                  <th className="px-5 py-3">
                    <MetricTooltip metric="impressions">Impressions</MetricTooltip>
                  </th>
                  <th className="px-5 py-3">
                    <MetricTooltip metric="clicks">Clicks</MetricTooltip>
                  </th>
                  <th className="px-5 py-3">
                    <MetricTooltip metric="conversions">Conversions</MetricTooltip>
                  </th>
                  <th className="px-5 py-3">
                    <MetricTooltip metric="ctr">CTR</MetricTooltip>
                  </th>
                  <th className="px-5 py-3">
                    <MetricTooltip metric="cpc">CPC</MetricTooltip>
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {daily.map((day) => {
                  const ctr = day.impressions > 0 ? (day.clicks / day.impressions) * 100 : 0;
                  const cpc = day.clicks > 0 ? day.spend / day.clicks : 0;
                  
                  return (
                    <tr key={day.date} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3">{formatCurrency(day.spend)}</td>
                      <td className="px-5 py-3">{formatNumber(day.impressions)}</td>
                      <td className="px-5 py-3">{formatNumber(day.clicks)}</td>
                      <td className="px-5 py-3 font-medium text-emerald-600">
                        {formatNumber(day.conversions)}
                      </td>
                      <td className="px-5 py-3">{ctr.toFixed(2)}%</td>
                      <td className="px-5 py-3">{formatCurrency(cpc)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gray-500">
            No daily breakdown available.
          </div>
        )}
      </div>
    </div>
  );
}
