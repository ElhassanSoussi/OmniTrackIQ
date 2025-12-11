"use client";

import { useState, useMemo, useEffect } from "react";
import { DashboardSection, DateRangeToggle, DateRangeValue } from "@/components/dashboard";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricTooltip } from "@/components/ui/metric-tooltip";
import { useCampaigns, CampaignMetrics, useCampaignDetail } from "@/hooks/useCampaigns";
import { useSampleDataStats, useGenerateSampleData } from "@/hooks/useSampleData";
import { getDateRange } from "@/lib/date-range";
import { formatCurrency, formatNumber, formatErrorMessage } from "@/lib/format";
import { trackDashboardView } from "@/lib/analytics";

const CHANNEL_OPTIONS = [
  { value: "", label: "All channels" },
  { value: "facebook", label: "Facebook Ads" },
  { value: "google_ads", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "snapchat", label: "Snapchat Ads" },
  { value: "pinterest", label: "Pinterest" },
];

const SORT_OPTIONS = [
  { value: "spend", label: "Spend (High to Low)" },
  { value: "roas", label: "ROAS (High to Low)" },
  { value: "clicks", label: "Clicks (High to Low)" },
  { value: "conversions", label: "Conversions (High to Low)" },
];

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  google_ads: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  tiktok: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  snapchat: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  pinterest: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  linkedin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  google_ads: "Google",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
};

export default function CampaignsPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const [channelFilter, setChannelFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("spend");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const { from, to } = getDateRange(range);

  // Track dashboard view (once per session)
  useEffect(() => {
    trackDashboardView("campaigns");
  }, []);

  const { data, isError, error, isPending } = useCampaigns(from, to, {
    platform: channelFilter || undefined,
    sortBy,
    limit: 100,
  });
  const { data: sampleDataStats } = useSampleDataStats();
  const generateSampleData = useGenerateSampleData();

  // Fetch detail for selected campaign
  const { data: campaignDetail, isPending: detailLoading } = useCampaignDetail(
    selectedCampaignId || "",
    from,
    to
  );

  const campaigns = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  // Calculate totals for summary
  const totals = useMemo(() => {
    const totalSpend = campaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    return { totalSpend, totalClicks, totalConversions, totalImpressions };
  }, [campaigns]);

  const hasNoCampaigns = !isPending && !isError && campaigns.length === 0;

  return (
    <div className="space-y-6">
      <DashboardSection
        title="Campaign Performance"
        description="Analyze spend, conversions, and ROAS across all your campaigns."
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="rounded-md border border-gh-border px-2 sm:px-3 py-2 text-sm bg-gh-canvas-default focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark"
              aria-label="Filter by channel"
            >
              {CHANNEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-gh-border px-2 sm:px-3 py-2 text-sm bg-gh-canvas-default focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark"
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <DateRangeToggle value={range} onChange={setRange} />
          </div>
        }
      >
        {/* Summary KPIs */}
        {!isPending && !isError && campaigns.length > 0 && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-gh-border bg-gh-canvas-default p-5 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
              <MetricTooltip metric="spend">
                <p className="text-sm font-medium text-gh-text-secondary dark:text-gh-text-secondary-dark">Total Spend</p>
              </MetricTooltip>
              <p className="mt-2 text-2xl font-bold text-gh-text-primary dark:text-gh-text-primary-dark">
                {formatCurrency(totals.totalSpend)}
              </p>
              <p className="text-xs text-gh-text-secondary dark:text-gh-text-secondary-dark">
                {campaigns.length} campaigns
              </p>
            </div>
            <div className="rounded-md border border-gh-border bg-gh-canvas-default p-5 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
              <MetricTooltip metric="clicks">
                <p className="text-sm font-medium text-gh-text-secondary dark:text-gh-text-secondary-dark">Total Clicks</p>
              </MetricTooltip>
              <p className="mt-2 text-2xl font-bold text-gh-text-primary dark:text-gh-text-primary-dark">
                {formatNumber(totals.totalClicks)}
              </p>
            </div>
            <div className="rounded-md border border-gh-border bg-gh-canvas-default p-5 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
              <MetricTooltip metric="conversions">
                <p className="text-sm font-medium text-gh-text-secondary dark:text-gh-text-secondary-dark">Total Conversions</p>
              </MetricTooltip>
              <p className="mt-2 text-2xl font-bold text-brand-600 dark:text-brand-400">
                {formatNumber(totals.totalConversions)}
              </p>
            </div>
            <div className="rounded-md border border-gh-border bg-gh-canvas-default p-5 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
              <MetricTooltip metric="impressions">
                <p className="text-sm font-medium text-gh-text-secondary dark:text-gh-text-secondary-dark">Impressions</p>
              </MetricTooltip>
              <p className="mt-2 text-2xl font-bold text-gh-text-primary dark:text-gh-text-primary-dark">
                {formatNumber(totals.totalImpressions)}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isPending && <TableSkeleton rows={5} />}

        {/* Error State */}
        {isError && (
          <div className="rounded-md border border-gh-danger-emphasis bg-gh-danger-subtle px-4 py-3 text-sm text-gh-danger-fg dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            Failed to load campaigns: {formatErrorMessage(error)}
          </div>
        )}

        {/* Empty State */}
        {hasNoCampaigns && (
          <EmptyState
            icon="campaigns"
            title="No campaigns yet"
            description="Connect your ad accounts to see campaign performance data, or generate sample data to explore the platform."
            actionLabel="Connect Ad Accounts"
            actionHref="/integrations"
            secondaryActionLabel={!sampleDataStats?.has_sample_data ? "Generate Sample Data" : undefined}
            onAction={!sampleDataStats?.has_sample_data ? () => generateSampleData.mutate() : undefined}
          />
        )}

        {/* Campaigns Table */}
        {!isPending && !isError && campaigns.length > 0 && (
          <div className="rounded-md border border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gh-border text-left text-xs font-medium uppercase tracking-wide text-gh-text-secondary dark:border-gh-border-dark dark:text-gh-text-secondary-dark">
                  <tr>
                    <th className="px-5 py-3">Campaign</th>
                    <th className="px-5 py-3">Channel</th>
                    <th className="px-5 py-3">
                      <MetricTooltip metric="spend">Spend</MetricTooltip>
                    </th>
                    <th className="px-5 py-3">
                      <MetricTooltip metric="roas">ROAS</MetricTooltip>
                    </th>
                    <th className="px-5 py-3">
                      <MetricTooltip metric="clicks">Clicks</MetricTooltip>
                    </th>
                    <th className="px-5 py-3">
                      <MetricTooltip metric="conversions">Conv.</MetricTooltip>
                    </th>
                    <th className="px-5 py-3">
                      <MetricTooltip metric="ctr">CTR</MetricTooltip>
                    </th>
                    <th className="px-5 py-3">
                      <MetricTooltip metric="cpc">CPC</MetricTooltip>
                    </th>
                    <th className="px-5 py-3">
                      <MetricTooltip metric="cpa">CPA</MetricTooltip>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gh-text-secondary dark:text-gh-text-secondary-dark">
                  {campaigns.map((campaign: CampaignMetrics) => {
                    const platform = campaign.platform || "unknown";
                    const colorClass = PLATFORM_COLORS[platform] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
                    const roasValue = campaign.roas || 0;
                    const roasColor = roasValue >= 3 ? "text-gh-success-fg dark:text-green-400" : roasValue >= 2 ? "text-gh-attention-fg dark:text-yellow-400" : "text-gh-danger-fg dark:text-red-400";

                    return (
                      <tr
                        key={campaign.campaign_id || campaign.campaign_name}
                        className="border-t border-gh-border hover:bg-gh-canvas-subtle dark:border-gh-border-dark dark:hover:bg-gh-canvas-subtle-dark cursor-pointer"
                        onClick={() => setSelectedCampaignId(campaign.campaign_id || null)}
                      >
                        <td className="px-5 py-3">
                          <div className="font-medium text-gh-text-primary dark:text-gh-text-primary-dark">
                            {campaign.campaign_name || campaign.name || "Untitled"}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
                            {campaign.platform_label || PLATFORM_LABELS[platform] || platform}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium">{formatCurrency(campaign.spend || 0)}</td>
                        <td className={`px-5 py-3 font-semibold ${roasColor}`}>
                          {roasValue.toFixed(2)}x
                        </td>
                        <td className="px-5 py-3">{formatNumber(campaign.clicks || 0)}</td>
                        <td className="px-5 py-3">{formatNumber(campaign.conversions || 0)}</td>
                        <td className="px-5 py-3">{(campaign.ctr || 0).toFixed(2)}%</td>
                        <td className="px-5 py-3">{formatCurrency(campaign.cpc || 0)}</td>
                        <td className="px-5 py-3">{formatCurrency(campaign.cpa || 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DashboardSection>

      {/* Campaign Detail Modal/Drawer */}
      {selectedCampaignId && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="campaign-detail-title" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedCampaignId(null)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl dark:bg-gray-900">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 id="campaign-detail-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Campaign Details
                  </h3>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setSelectedCampaignId(null)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-5">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
                  </div>
                ) : campaignDetail ? (
                  <div className="space-y-6">
                    {/* Campaign Name & Platform */}
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {campaignDetail.campaign_name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {PLATFORM_LABELS[campaignDetail.platform] || campaignDetail.platform}
                      </p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Spend</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(campaignDetail.summary?.spend || 0)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Clicks</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatNumber(campaignDetail.summary?.clicks || 0)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Conversions</p>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatNumber(campaignDetail.summary?.conversions || 0)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400">CPA</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(campaignDetail.summary?.cpa || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Daily Performance Chart */}
                    {campaignDetail.daily && campaignDetail.daily.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Daily Performance
                        </h5>
                        <div className="h-48 flex items-end justify-between gap-1">
                          {campaignDetail.daily.slice(-14).map((point, idx) => {
                            const maxSpend = Math.max(...campaignDetail.daily.map(d => d.spend || 0)) || 1;
                            const height = ((point.spend || 0) / maxSpend) * 100;
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                  className="w-full bg-emerald-500 rounded-t transition-all"
                                  style={{ height: `${height}%`, minHeight: '4px' }}
                                  title={`${point.date}: ${formatCurrency(point.spend || 0)}`}
                                />
                                <span className="text-[10px] text-gray-400 truncate w-full text-center">
                                  {new Date(point.date).getDate()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Daily Data Table */}
                    {campaignDetail.daily && campaignDetail.daily.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Daily Breakdown
                        </h5>
                        <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                          <table className="w-full text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">Date</th>
                                <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Spend</th>
                                <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Clicks</th>
                                <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Conv.</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                              {campaignDetail.daily.slice().reverse().map((row) => (
                                <tr key={row.date}>
                                  <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{row.date}</td>
                                  <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{formatCurrency(row.spend || 0)}</td>
                                  <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatNumber(row.clicks || 0)}</td>
                                  <td className="px-3 py-2 text-right text-emerald-600 dark:text-emerald-400">{formatNumber(row.conversions || 0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Campaign not found
                  </p>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex justify-end">
                <button
                  type="button"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  onClick={() => setSelectedCampaignId(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
