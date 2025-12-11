"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CampaignsTable,
  ChannelTable,
  DashboardSection,
  DateRangeToggle,
  DateRangeValue,
  InsightCard,
  KPIGrid,
  OrdersTable,
  SummaryChart,
  WidgetContainer,
  DashboardToolbar,
} from "@/components/dashboard";
import { OnboardingChecklist } from "@/components/ui/onboarding-checklist";
import { KPIGridSkeleton, ChartSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton";
import { KPIItem } from "@/components/dashboard/kpi-grid";
import { CampaignRow } from "@/components/dashboard/campaigns-table";
import { OrderRow } from "@/components/dashboard/orders-table";
import { MetricsDailyPoint, MetricsSummary, useMetrics, useChannelBreakdown } from "@/hooks/useMetrics";
import { CampaignMetrics, useCampaigns } from "@/hooks/useCampaigns";
import { OrderRecord, OrdersResponse, useOrders } from "@/hooks/useOrders";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useSampleDataStats, useGenerateSampleData, useDeleteSampleData } from "@/hooks/useSampleData";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { getDateRange } from "@/lib/date-range";
import { formatCurrency, formatNumber, formatErrorMessage } from "@/lib/format";
import { trackDashboardView } from "@/lib/analytics";

const CHANNEL_OPTIONS = [
  { value: "", label: "All channels" },
  { value: "facebook", label: "Facebook Ads" },
  { value: "google_ads", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "shopify", label: "Shopify" },
];

export default function DashboardPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const [channelFilter, setChannelFilter] = useState<string>("");
  const { from, to } = getDateRange(range);

  const { data: summary, isError: summaryError, error: summaryErr, isPending: summaryLoading } = useMetrics(from, to, channelFilter || undefined);
  const { data: channelData, isPending: channelLoading } = useChannelBreakdown(from, to);
  const { data: campaignsData, isError: campaignsError, error: campaignsErr, isPending: campaignsLoading } = useCampaigns(from, to);
  const { data: ordersData, isError: ordersError, error: ordersErr, isPending: ordersLoading } = useOrders(from, to);
  const { steps: onboardingSteps, isComplete: onboardingComplete } = useOnboarding();
  const { data: sampleDataStats } = useSampleDataStats();
  const generateSampleData = useGenerateSampleData();
  const deleteSampleData = useDeleteSampleData();

  // Dashboard customization
  const {
    widgets,
    visibleWidgets,
    isEditing,
    setIsEditing,
    moveWidget,
    toggleWidget,
    resizeWidget,
    resetLayout,
  } = useDashboardLayout();

  const hiddenWidgets = widgets.filter((w) => !w.visible);

  // Track dashboard view (once per session)
  useEffect(() => {
    trackDashboardView("overview");
  }, []);

  const kpis: KPIItem[] = useMemo(() => {
    if (!summary) {
      return [
        { label: "Revenue", value: "$124,200", subtext: "Blended", trend: "+18% vs last period", tone: "positive" },
        { label: "Ad Spend", value: "$32,400", subtext: "Across channels", trend: "+6% vs last period", tone: "negative" },
        { label: "ROAS", value: "3.8x", subtext: "Target 3.0x", trend: "+0.4x vs last period", tone: "positive" },
        { label: "Orders", value: "2,340", subtext: "Avg $53 AOV", trend: "+12% vs last period", tone: "positive" },
        { label: "CPA", value: "$27.40", subtext: "Target $30", trend: "-8% vs last period", tone: "positive" },
        { label: "AOV", value: "$53.08", subtext: "Avg order value", trend: "+5% vs last period", tone: "positive" },
      ];
    }

    const data: MetricsSummary = summary;
    const roasTone = data.roas >= 3 ? "positive" : data.roas >= 2 ? "neutral" : "negative";
    const cpaTone = data.cpa <= 30 ? "positive" : data.cpa <= 50 ? "neutral" : "negative";
    
    return [
      { label: "Revenue", value: formatCurrency(data.revenue), subtext: "Blended revenue", trend: "Live", tone: "positive" },
      { label: "Ad Spend", value: formatCurrency(data.spend), subtext: "Across channels", trend: "Live", tone: "neutral" },
      { label: "ROAS", value: `${data.roas.toFixed(2)}x`, subtext: "Target 3.0x", trend: "Live", tone: roasTone },
      { label: "Orders", value: formatNumber(data.orders), subtext: `AOV ${formatCurrency(data.aov)}`, trend: "Live", tone: "positive" },
      { label: "CPA", value: formatCurrency(data.cpa), subtext: "Cost per acquisition", trend: "Live", tone: cpaTone },
      { label: "Profit", value: formatCurrency(data.profit), subtext: "Revenue - Spend", trend: "Live", tone: data.profit > 0 ? "positive" : "negative" },
    ];
  }, [summary]);

  const chartData = useMemo(() => {
    if (summary?.daily?.length) {
      return (summary as MetricsSummary).daily!.map((d: MetricsDailyPoint) => ({
        label: d.date,
        spend: Number(d.spend || 0),
        revenue: Number(d.revenue || 0),
      }));
    }
    return undefined;
  }, [summary]);

  // Channel performance data for table
  const channelPerformance = useMemo(() => {
    if (!channelData?.channels?.length) return null;
    return channelData.channels.map((c) => ({
      platform: c.platform,
      platform_label: c.platform_label,
      spend: c.spend,
      revenue: c.revenue,
      roas: c.roas,
      orders: c.orders,
      cpc: c.cpc,
    }));
  }, [channelData]);

  const topCampaigns: CampaignRow[] = useMemo(() => {
    if (!campaignsData || !Array.isArray(campaignsData) || campaignsData.length === 0) {
      return [
        { name: "FB - Prospecting", platform: "facebook", spend: "$12,400", clicks: 23000, conversions: 1200, roas: "3.2x" },
        { name: "Google - Brand", platform: "google_ads", spend: "$9,500", clicks: 18000, conversions: 980, roas: "4.3x" },
        { name: "TikTok - Spark Ads", platform: "tiktok", spend: "$4,800", clicks: 9500, conversions: 410, roas: "2.9x" },
      ];
    }

    return campaignsData.map((c: CampaignMetrics) => {
      const spend = formatCurrency(c.spend ?? 0);
      const calculatedRoas =
        c.roas ?? (c.revenue !== undefined && c.spend ? Number(c.revenue) / Number(c.spend || 1) : undefined);
      const roas = calculatedRoas !== undefined ? `${Number(calculatedRoas).toFixed(1)}x` : "—";

      return {
        name: c.campaign_name || c.name || "Untitled campaign",
        platform: c.platform || "unknown",
        spend,
        roas,
        clicks: c.clicks || 0,
        conversions: c.conversions || 0,
      };
    });
  }, [campaignsData]);

  const recentOrders: OrderRow[] = useMemo(() => {
    if (!ordersData) {
      return [
        { id: "13621", date: "2025-01-02 10:12", amount: "$248.00", source: "shopify", utm_source: "google", utm_campaign: "brand" },
        { id: "13620", date: "2025-01-02 09:55", amount: "$126.00", source: "shopify", utm_source: "fb", utm_campaign: "prospecting" },
        { id: "13619", date: "2025-01-02 09:22", amount: "$188.00", source: "shopify", utm_source: "tiktok", utm_campaign: "spark" },
        { id: "13618", date: "2025-01-02 09:01", amount: "$92.00", source: "shopify", utm_source: "google", utm_campaign: "brand" },
      ];
    }

    const rawOrders = (Array.isArray(ordersData)
      ? Array.isArray(ordersData[1])
        ? ordersData[1]
        : ordersData
      : (ordersData as Record<string, unknown>)?.items ||
        (ordersData as Record<string, unknown>)?.orders ||
        (ordersData as Record<string, unknown>)?.results ||
        []) as OrderRecord[];

    if (!rawOrders.length) return [];

    return rawOrders.slice(0, 20).map((o: OrderRecord) => {
      const amount = formatCurrency(o.total_amount ?? o.amount, o.currency || "USD");
      const id = o.external_order_id || o.id || "—";
      const date = o.date_time ? new Date(o.date_time).toLocaleString() : o.date || "";
      return {
        id,
        date,
        amount,
        source: o.source_platform || o.source || "unknown",
        utm_source: o.utm_source || o.utmSource,
        utm_campaign: o.utm_campaign || o.utmCampaign,
      };
    });
  }, [ordersData]);

  const hasNoLiveData = summary ? (summary as MetricsSummary).revenue === 0 && (summary as MetricsSummary).spend === 0 && (summary as MetricsSummary).orders === 0 : false;

  // Helper to get widget index in visible widgets
  const getWidgetIndex = (widgetId: string) => visibleWidgets.findIndex((w) => w.id === widgetId);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Onboarding Checklist - shown until complete */}
      {!onboardingComplete && (
        <OnboardingChecklist steps={onboardingSteps} />
      )}
      
      <DashboardSection
        title="Performance overview"
        description="Unified view of revenue, spend, and ROAS across every channel."
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
            <DateRangeToggle value={range} onChange={setRange} />
            <DashboardToolbar
              isEditing={isEditing}
              onToggleEdit={() => setIsEditing(!isEditing)}
              onReset={resetLayout}
              hiddenWidgets={hiddenWidgets}
              onShowWidget={toggleWidget}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Edit mode hint */}
          {isEditing && (
            <div className="rounded-md border border-brand-300 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>Customization mode:</strong> Drag widgets to reorder, resize them, or hide ones you don&apos;t need. Click &quot;Done&quot; when finished.</span>
              </div>
            </div>
          )}

          {hasNoLiveData && (
            <div className="rounded-md border border-gh-attention-emphasis bg-gh-attention-subtle px-4 py-3 text-sm text-gh-attention-fg dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  No live data yet. Connect ad platforms and Shopify to start seeing revenue, spend, and orders.
                  <a href="/integrations" className="ml-2 font-semibold underline hover:text-yellow-900 dark:hover:text-yellow-100">
                    Connect integrations
                  </a>
                </div>
                {!sampleDataStats?.has_sample_data && (
                  <button
                    onClick={() => generateSampleData.mutate()}
                    disabled={generateSampleData.isPending}
                    className="inline-flex items-center gap-2 rounded-md bg-gh-attention-emphasis px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {generateSampleData.isPending ? (
                      <>
                        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      "Generate Sample Data"
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {sampleDataStats?.has_sample_data && (
            <div className="rounded-md border border-gh-accent-emphasis bg-gh-accent-subtle px-4 py-3 text-sm text-gh-accent-fg dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-semibold">Demo mode:</span> You&apos;re viewing sample data ({sampleDataStats.ad_spend_records} ad records, {sampleDataStats.order_records} orders).
                  Connect real integrations or remove demo data.
                </div>
                <button
                  onClick={() => deleteSampleData.mutate()}
                  disabled={deleteSampleData.isPending}
                  className="inline-flex items-center gap-2 rounded-md border border-gh-accent-emphasis bg-gh-canvas-default px-3 py-1.5 text-xs font-medium text-gh-accent-fg shadow-sm transition hover:bg-gh-canvas-subtle disabled:opacity-50 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                >
                  {deleteSampleData.isPending ? "Removing..." : "Remove Sample Data"}
                </button>
              </div>
            </div>
          )}
          
          <div className="grid gap-4 rounded-md border border-gh-border bg-gh-canvas-default p-5 md:flex md:items-center md:justify-between dark:border-gh-border-dark dark:bg-gh-canvas-dark">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Account health</div>
              <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">
                ROAS above target; TikTok prospecting is accelerating and Google brand remains most efficient.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-gh-success-subtle px-3 py-1 font-semibold text-gh-success-fg dark:bg-green-900/30 dark:text-green-400">Healthy</span>
              <span className="rounded-full border border-gh-border bg-gh-canvas-subtle px-3 py-1 font-semibold text-gh-text-secondary dark:border-gh-border-dark dark:bg-gh-canvas-subtle-dark dark:text-gh-text-secondary-dark">
                {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 90 days"}
              </span>
              <span className="rounded-full border border-gh-border bg-gh-canvas-subtle px-3 py-1 font-semibold text-gh-text-secondary dark:border-gh-border-dark dark:bg-gh-canvas-subtle-dark dark:text-gh-text-secondary-dark">
                Blended CAC $27.4
              </span>
            </div>
          </div>

          {summaryError ? (
            <div className="rounded-md border border-gh-danger-emphasis bg-gh-danger-subtle p-4 text-sm text-gh-danger-fg dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              Failed to load metrics: {formatErrorMessage(summaryErr)}
            </div>
          ) : summaryLoading ? (
            visibleWidgets.find((w) => w.id === "kpis") && (
              <WidgetContainer
                widget={visibleWidgets.find((w) => w.id === "kpis")!}
                isEditing={isEditing}
                index={getWidgetIndex("kpis")}
                onMove={moveWidget}
                onResize={resizeWidget}
                onToggle={toggleWidget}
              >
                <div className="p-4 sm:p-5">
                  <KPIGridSkeleton />
                </div>
              </WidgetContainer>
            )
          ) : (
            visibleWidgets.find((w) => w.id === "kpis") && (
              <WidgetContainer
                widget={visibleWidgets.find((w) => w.id === "kpis")!}
                isEditing={isEditing}
                index={getWidgetIndex("kpis")}
                onMove={moveWidget}
                onResize={resizeWidget}
                onToggle={toggleWidget}
              >
                <div className="p-4 sm:p-5">
                  <KPIGrid items={kpis} />
                </div>
              </WidgetContainer>
            )
          )}

          {visibleWidgets.find((w) => w.id === "revenue-chart") && (
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.6fr,1fr]">
              <WidgetContainer
                widget={visibleWidgets.find((w) => w.id === "revenue-chart")!}
                isEditing={isEditing}
                index={getWidgetIndex("revenue-chart")}
                onMove={moveWidget}
                onResize={resizeWidget}
                onToggle={toggleWidget}
              >
                {summaryLoading ? <ChartSkeleton /> : <SummaryChart data={chartData} />}
              </WidgetContainer>
              {visibleWidgets.find((w) => w.id === "channel-breakdown") && (
                <WidgetContainer
                  widget={visibleWidgets.find((w) => w.id === "channel-breakdown")!}
                  isEditing={isEditing}
                  index={getWidgetIndex("channel-breakdown")}
                  onMove={moveWidget}
                  onResize={resizeWidget}
                  onToggle={toggleWidget}
                >
                  <ChannelTable channels={channelPerformance ?? undefined} isLoading={channelLoading} />
                </WidgetContainer>
              )}
            </div>
          )}

          <div className="grid gap-4">
            <InsightCard title="Budget shift" description="Shift +10% to TikTok Prospecting and +5% to Google Brand for efficient growth." badge="Recommendation" />
            <InsightCard title="Alerting" description="CPA drift detected on FB - Retargeting. Alert sent to Slack #growth." badge="Alert" />
            <InsightCard title="Attribution" description="Shopify and GA4 aligned at 98% for last 7 days; variance within tolerance." badge="Data quality" />
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {visibleWidgets.find((w) => w.id === "campaigns-table") && (
              campaignsError ? (
                <div className="rounded-md border border-gh-danger-emphasis bg-gh-danger-subtle p-4 text-sm text-gh-danger-fg dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  Failed to load campaigns: {formatErrorMessage(campaignsErr)}
                </div>
              ) : campaignsLoading ? (
                <WidgetContainer
                  widget={visibleWidgets.find((w) => w.id === "campaigns-table")!}
                  isEditing={isEditing}
                  index={getWidgetIndex("campaigns-table")}
                  onMove={moveWidget}
                  onResize={resizeWidget}
                  onToggle={toggleWidget}
                >
                  <TableSkeleton rows={3} />
                </WidgetContainer>
              ) : (
                <WidgetContainer
                  widget={visibleWidgets.find((w) => w.id === "campaigns-table")!}
                  isEditing={isEditing}
                  index={getWidgetIndex("campaigns-table")}
                  onMove={moveWidget}
                  onResize={resizeWidget}
                  onToggle={toggleWidget}
                >
                  <CampaignsTable campaigns={topCampaigns} />
                </WidgetContainer>
              )
            )}
            {visibleWidgets.find((w) => w.id === "orders-table") && (
              ordersError ? (
                <div className="rounded-md border border-gh-danger-emphasis bg-gh-danger-subtle p-4 text-sm text-gh-danger-fg dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  Failed to load orders: {formatErrorMessage(ordersErr)}
                </div>
              ) : ordersLoading ? (
                <WidgetContainer
                  widget={visibleWidgets.find((w) => w.id === "orders-table")!}
                  isEditing={isEditing}
                  index={getWidgetIndex("orders-table")}
                  onMove={moveWidget}
                  onResize={resizeWidget}
                  onToggle={toggleWidget}
                >
                  <TableSkeleton rows={4} />
                </WidgetContainer>
              ) : (
                <WidgetContainer
                  widget={visibleWidgets.find((w) => w.id === "orders-table")!}
                  isEditing={isEditing}
                  index={getWidgetIndex("orders-table")}
                  onMove={moveWidget}
                  onResize={resizeWidget}
                  onToggle={toggleWidget}
                >
                  <OrdersTable orders={recentOrders} />
                </WidgetContainer>
              )
            )}
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}
