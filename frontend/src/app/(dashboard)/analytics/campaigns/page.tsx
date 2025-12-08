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

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas?: number;
  revenue?: number;
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

const PLATFORM_COLORS: Record<string, { bg: string; badge: string }> = {
  facebook: { bg: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  google_ads: { bg: "bg-red-500", badge: "bg-red-100 text-red-700" },
  tiktok: { bg: "bg-gray-900", badge: "bg-gray-100 text-gray-700" },
  snapchat: { bg: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700" },
  pinterest: { bg: "bg-red-600", badge: "bg-red-100 text-red-700" },
  linkedin: { bg: "bg-blue-700", badge: "bg-blue-100 text-blue-800" },
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  google_ads: "Google",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
};

type SortField = "spend" | "clicks" | "conversions" | "ctr" | "cpc" | "cpa";
type SortDirection = "asc" | "desc";

export default function CampaignsAnalyticsPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const [platform, setPlatform] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("spend");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [search, setSearch] = useState("");
  
  const { from, to } = getDateRange(range);

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns-analytics", from, to, platform],
    queryFn: () => {
      const params = new URLSearchParams({ from, to, sort_by: "spend", limit: "100" });
      if (platform !== "all") params.set("platform", platform);
      return apiFetch(`/metrics/campaigns?${params}`) as Promise<Campaign[]>;
    },
  });

  const { data: topByConversions, isLoading: topConvLoading } = useQuery<TopPerformer[]>({
    queryKey: ["top-conversions", from, to],
    queryFn: () => apiFetch(`/metrics/top-performers?from=${from}&to=${to}&metric=conversions&limit=5`) as Promise<TopPerformer[]>,
  });

  const { data: topByClicks, isLoading: topClicksLoading } = useQuery<TopPerformer[]>({
    queryKey: ["top-clicks", from, to],
    queryFn: () => apiFetch(`/metrics/top-performers?from=${from}&to=${to}&metric=clicks&limit=5`) as Promise<TopPerformer[]>,
  });

  const { data: sampleDataStats } = useSampleDataStats();
  const generateSampleData = useGenerateSampleData();

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    
    let filtered = campaigns;
    
    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((c) => 
        c.campaign_name.toLowerCase().includes(searchLower) ||
        c.platform.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });
    
    return filtered;
  }, [campaigns, search, sortField, sortDirection]);

  // Calculate summary stats
  const summary = useMemo(() => {
    if (!filteredCampaigns || filteredCampaigns.length === 0) {
      return { totalSpend: 0, totalClicks: 0, totalConversions: 0, avgCPC: 0, avgCPA: 0, campaignCount: 0 };
    }
    
    const totalSpend = filteredCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalClicks = filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0);
    
    return {
      totalSpend,
      totalClicks,
      totalConversions,
      avgCPC: totalClicks > 0 ? totalSpend / totalClicks : 0,
      avgCPA: totalConversions > 0 ? totalSpend / totalConversions : 0,
      campaignCount: filteredCampaigns.length,
    };
  }, [filteredCampaigns]);

  // Available platforms from data
  const availablePlatforms = useMemo(() => {
    if (!campaigns) return [];
    const platforms = [...new Set(campaigns.map((c) => c.platform))];
    return platforms.sort();
  }, [campaigns]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === "desc" ? (
      <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ) : (
      <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/analytics" className="hover:text-emerald-600">Analytics</Link>
            <span>/</span>
            <span className="text-gray-900">Campaigns</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Performance</h1>
          <p className="mt-1 text-gray-500">Detailed metrics and ROI analysis for all campaigns</p>
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
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {campaignsLoading ? "..." : formatNumber(summary.campaignCount)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <MetricTooltip metric="spend">
            <p className="text-sm font-medium text-gray-500">Total Spend</p>
          </MetricTooltip>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {campaignsLoading ? "..." : formatCurrency(summary.totalSpend)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <MetricTooltip metric="clicks">
            <p className="text-sm font-medium text-gray-500">Total Clicks</p>
          </MetricTooltip>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {campaignsLoading ? "..." : formatNumber(summary.totalClicks)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <MetricTooltip metric="conversions">
            <p className="text-sm font-medium text-gray-500">Conversions</p>
          </MetricTooltip>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {campaignsLoading ? "..." : formatNumber(summary.totalConversions)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <MetricTooltip metric="cpc">
            <p className="text-sm font-medium text-gray-500">Avg CPC</p>
          </MetricTooltip>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {campaignsLoading ? "..." : formatCurrency(summary.avgCPC)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <MetricTooltip metric="cpa">
            <p className="text-sm font-medium text-gray-500">Avg CPA</p>
          </MetricTooltip>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {campaignsLoading ? "..." : formatCurrency(summary.avgCPA)}
          </p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Top by Conversions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-2">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Top by Conversions</h2>
              <p className="text-xs text-gray-500">Best performing campaigns</p>
            </div>
          </div>
          
          {topConvLoading ? (
            <div className="mt-4 animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded bg-gray-100" />)}
            </div>
          ) : topByConversions && topByConversions.length > 0 ? (
            <div className="mt-4 space-y-2">
              {topByConversions.map((c) => (
                <div key={c.campaign_id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {c.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{c.campaign_name}</p>
                    <p className="text-xs text-gray-500">{PLATFORM_LABELS[c.platform] || c.platform}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{formatNumber(c.conversions)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
              No conversion data available
            </div>
          )}
        </div>

        {/* Top by Clicks */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-50 p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Top by Clicks</h2>
              <p className="text-xs text-gray-500">Highest traffic campaigns</p>
            </div>
          </div>
          
          {topClicksLoading ? (
            <div className="mt-4 animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded bg-gray-100" />)}
            </div>
          ) : topByClicks && topByClicks.length > 0 ? (
            <div className="mt-4 space-y-2">
              {topByClicks.map((c) => (
                <div key={c.campaign_id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {c.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{c.campaign_name}</p>
                    <p className="text-xs text-gray-500">{PLATFORM_LABELS[c.platform] || c.platform}</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">{formatNumber(c.clicks)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
              No click data available
            </div>
          )}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Filters */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              aria-label="Filter by platform"
            >
              <option value="all">All Platforms</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>{PLATFORM_LABELS[p] || p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {campaignsLoading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded bg-gray-100" />)}
              </div>
            </div>
          ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Campaign</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Platform</th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => handleSort("spend")} className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900">
                      Spend <SortIcon field="spend" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => handleSort("clicks")} className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900">
                      Clicks <SortIcon field="clicks" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => handleSort("conversions")} className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900">
                      Conv. <SortIcon field="conversions" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => handleSort("ctr")} className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900">
                      CTR <SortIcon field="ctr" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => handleSort("cpc")} className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900">
                      CPC <SortIcon field="cpc" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => handleSort("cpa")} className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900">
                      CPA <SortIcon field="cpa" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.campaign_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{campaign.campaign_name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px]">{campaign.campaign_id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PLATFORM_COLORS[campaign.platform]?.badge || "bg-gray-100 text-gray-700"}`}>
                        {PLATFORM_LABELS[campaign.platform] || campaign.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(campaign.spend)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatNumber(campaign.clicks)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatNumber(campaign.conversions)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${campaign.ctr > 2 ? "text-emerald-600" : campaign.ctr > 1 ? "text-yellow-600" : "text-gray-600"}`}>
                        {campaign.ctr.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(campaign.cpc)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${campaign.cpa < 20 ? "text-emerald-600" : campaign.cpa < 50 ? "text-yellow-600" : "text-red-600"}`}>
                        {formatCurrency(campaign.cpa)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <EmptyState
                icon="campaigns"
                title={search ? "No campaigns match your search" : "No campaigns found"}
                description={search ? "Try adjusting your search or filters" : "Connect ad platforms to see campaign data, or generate sample data to explore."}
                actionLabel={search ? undefined : "Connect Integrations"}
                actionHref={search ? undefined : "/integrations"}
                secondaryActionLabel={!search && !sampleDataStats?.has_sample_data ? "Generate Sample Data" : undefined}
                onAction={!search && !sampleDataStats?.has_sample_data ? () => generateSampleData.mutate() : undefined}
              />
            </div>
          )}
        </div>

        {/* Pagination hint */}
        {filteredCampaigns && filteredCampaigns.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
            Showing {filteredCampaigns.length} campaigns
          </div>
        )}
      </div>
    </div>
  );
}
