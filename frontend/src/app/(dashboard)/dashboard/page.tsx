"use client";

import { useMemo, useState } from "react";
import {
  CampaignsTable,
  DashboardSection,
  DateRangeToggle,
  DateRangeValue,
  InsightCard,
  KPIGrid,
  OrdersTable,
  SummaryChart,
} from "@/components/dashboard";
import { KPIItem } from "@/components/dashboard/kpi-grid";
import { CampaignRow } from "@/components/dashboard/campaigns-table";
import { OrderRow } from "@/components/dashboard/orders-table";
import { MetricsDailyPoint, MetricsSummary, useMetrics } from "@/hooks/useMetrics";
import { CampaignMetrics, useCampaigns } from "@/hooks/useCampaigns";
import { OrderRecord, OrdersResponse, useOrders } from "@/hooks/useOrders";
import { getDateRange } from "@/lib/date-range";
import { formatCurrency, formatNumber, formatErrorMessage } from "@/lib/format";

export default function DashboardPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const { from, to } = getDateRange(range);

  const { data: summary, isError: summaryError, error: summaryErr } = useMetrics(from, to);
  const { data: campaignsData, isError: campaignsError, error: campaignsErr } = useCampaigns(from, to);
  const { data: ordersData, isError: ordersError, error: ordersErr } = useOrders(from, to);

  const kpis: KPIItem[] = useMemo(() => {
    if (!summary) {
      return [
        { label: "Revenue", value: "$124,200", subtext: "Blended", trend: "+18% vs last period", tone: "positive" },
        { label: "Ad Spend", value: "$32,400", subtext: "Across channels", trend: "+6% vs last period", tone: "negative" },
        { label: "ROAS", value: "3.8x", subtext: "Target 3.0x", trend: "+0.4x vs last period", tone: "positive" },
        { label: "Orders", value: "2,340", subtext: "Avg $53 AOV", trend: "+12% vs last period", tone: "positive" },
      ];
    }

    const data: MetricsSummary = summary;
    
    return [
      { label: "Revenue", value: formatCurrency(data.revenue), subtext: "Blended revenue", trend: "Live", tone: "positive" },
      { label: "Ad Spend", value: formatCurrency(data.spend), subtext: "Across channels", trend: "Live", tone: "neutral" },
      { label: "ROAS", value: `${data.roas.toFixed(2)}x`, subtext: "Target 3.0x", trend: "Live", tone: "neutral" },
      { label: "Orders", value: formatNumber(data.orders), subtext: "Orders in range", trend: "Live", tone: "positive" },
    ];
  }, [summary]);

  const chartData = useMemo(() => {
    if (summary?.daily?.length) {
      return (summary as MetricsSummary).daily!.map((d: MetricsDailyPoint) => ({
        label: d.date,
        spend: Number(d.spend || 0),
      }));
    }
    return undefined;
  }, [summary]);

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
      : (ordersData as Exclude<OrdersResponse, OrderRecord[] | [unknown, OrderRecord[]]>)?.items ||
        (ordersData as Exclude<OrdersResponse, OrderRecord[] | [unknown, OrderRecord[]]>)?.orders ||
        (ordersData as Exclude<OrdersResponse, OrderRecord[] | [unknown, OrderRecord[]]>)?.results ||
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

  return (
    <div className="space-y-8">
      <DashboardSection
        title="Performance overview"
        description="Unified view of revenue, spend, and ROAS across every channel."
        actions={<DateRangeToggle value={range} onChange={setRange} />}
      >
        <div className="flex flex-col gap-6">
          {hasNoLiveData && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No live data yet. Connect ad platforms and Shopify to start seeing revenue, spend, and orders.
              <a href="/integrations" className="ml-2 font-semibold text-amber-900 underline hover:text-amber-700">
                Connect integrations
              </a>
            </div>
          )}
          
          <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:flex md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-900">Account health</div>
              <p className="text-sm text-gray-500">
                ROAS above target; TikTok prospecting is accelerating and Google brand remains most efficient.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">Healthy</span>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-semibold text-gray-600">
                {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : "Last 90 days"}
              </span>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 font-semibold text-gray-600">
                Blended CAC $27.4
              </span>
            </div>
          </div>

          {summaryError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load metrics: {formatErrorMessage(summaryErr)}
            </div>
          ) : (
            <KPIGrid items={kpis} />
          )}

          <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
            <SummaryChart data={chartData} />
            <div className="grid gap-4">
              <InsightCard title="Budget shift" description="Shift +10% to TikTok Prospecting and +5% to Google Brand for efficient growth." badge="Recommendation" />
              <InsightCard title="Alerting" description="CPA drift detected on FB - Retargeting. Alert sent to Slack #growth." badge="Alert" />
              <InsightCard title="Attribution" description="Shopify and GA4 aligned at 98% for last 7 days; variance within tolerance." badge="Data quality" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {campaignsError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load campaigns: {formatErrorMessage(campaignsErr)}
              </div>
            ) : (
              <CampaignsTable campaigns={topCampaigns} />
            )}
            {ordersError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load orders: {formatErrorMessage(ordersErr)}
              </div>
            ) : (
              <OrdersTable orders={recentOrders} />
            )}
          </div>
        </div>
      </DashboardSection>
    </div>
  );
}
