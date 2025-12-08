"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardSection, DateRangeToggle, DateRangeValue, OrdersTable, KPICard } from "@/components/dashboard";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricTooltip } from "@/components/ui/metric-tooltip";
import { OrderRow } from "@/components/dashboard/orders-table";
import { OrderRecord, OrdersResponse, useOrders, useOrdersSummary } from "@/hooks/useOrders";
import { useSampleDataStats, useGenerateSampleData } from "@/hooks/useSampleData";
import { getDateRange } from "@/lib/date-range";
import { formatCurrency, formatNumber, formatErrorMessage } from "@/lib/format";

const SOURCE_COLORS: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-700",
  fb: "bg-blue-100 text-blue-700",
  google: "bg-red-100 text-red-700",
  tiktok: "bg-gray-100 text-gray-700",
  snapchat: "bg-yellow-100 text-yellow-700",
  pinterest: "bg-red-100 text-red-600",
  email: "bg-orange-100 text-orange-700",
  organic: "bg-green-100 text-green-700",
  direct: "bg-purple-100 text-purple-700",
};

const SOURCE_LABELS: Record<string, string> = {
  facebook: "Facebook",
  fb: "Facebook",
  google: "Google",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  pinterest: "Pinterest",
  email: "Email",
  organic: "Organic",
  direct: "Direct",
};

export default function OrdersPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const { from, to } = getDateRange(range);
  
  const { data, isLoading, isError, error } = useOrders(from, to, { 
    utm_source: sourceFilter || undefined,
    limit: 100 
  });
  const { data: summaryData, isLoading: summaryLoading } = useOrdersSummary(from, to);
  const { data: sampleDataStats } = useSampleDataStats();
  const generateSampleData = useGenerateSampleData();

  const rawOrders = data
    ? ((Array.isArray(data)
        ? Array.isArray((data as unknown[])[1])
          ? (data as unknown[])[1]
          : data
        : (data as { items?: OrderRecord[] }).items || 
          (data as { orders?: OrderRecord[] }).orders || 
          (data as { results?: OrderRecord[] }).results || 
          []) as OrderRecord[])
    : [];

  const orders: OrderRow[] = rawOrders.map((o: OrderRecord) => {
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

  // Get available sources for filter
  const availableSources = useMemo(() => {
    if (!summaryData?.orders_by_source) return [];
    return Object.keys(summaryData.orders_by_source).sort();
  }, [summaryData]);

  // Attribution breakdown data
  const attributionData = useMemo(() => {
    if (!summaryData?.revenue_by_source) return [];
    
    const totalRevenue = summaryData.total_revenue || 1;
    return Object.entries(summaryData.revenue_by_source)
      .map(([source, revenue]) => ({
        source,
        label: SOURCE_LABELS[source.toLowerCase()] || source,
        revenue,
        orders: summaryData.orders_by_source[source] || 0,
        percentage: (revenue / totalRevenue) * 100,
        color: SOURCE_COLORS[source.toLowerCase()] || "bg-gray-100 text-gray-700",
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [summaryData]);

  const hasNoOrders = !isLoading && !isError && orders.length === 0;

  return (
    <div className="space-y-8">
      <DashboardSection
        title="Orders"
        description="Revenue attribution and order analytics with UTM tracking."
        actions={
          <div className="flex items-center gap-3">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              aria-label="Filter by source"
            >
              <option value="">All sources</option>
              {availableSources.map((s) => (
                <option key={s} value={s}>{SOURCE_LABELS[s.toLowerCase()] || s}</option>
              ))}
            </select>
            <DateRangeToggle value={range} onChange={setRange} />
          </div>
        }
      >
        {/* KPI Summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <MetricTooltip metric="revenue">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            </MetricTooltip>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {summaryLoading ? "..." : formatCurrency(summaryData?.total_revenue || 0)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <MetricTooltip metric="orders">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
            </MetricTooltip>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {summaryLoading ? "..." : formatNumber(summaryData?.total_orders || 0)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <MetricTooltip metric="aov">
              <p className="text-sm font-medium text-gray-500">Average Order Value</p>
            </MetricTooltip>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {summaryLoading ? "..." : formatCurrency(summaryData?.aov || 0)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-500">Attribution Sources</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {summaryLoading ? "..." : availableSources.length}
            </p>
          </div>
        </div>

        {/* Attribution Breakdown */}
        {attributionData.length > 0 && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Revenue Attribution</h3>
                <p className="text-sm text-gray-500">Last-touch attribution by source</p>
              </div>
              <Link 
                href="/analytics/revenue" 
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View detailed analytics →
              </Link>
            </div>
            <div className="space-y-3">
              {attributionData.slice(0, 5).map((item) => (
                <div key={item.source} className="flex items-center gap-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${item.color} min-w-[80px] text-center`}>
                    {item.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-gray-900 min-w-[80px] text-right">
                      {formatCurrency(item.revenue)}
                    </span>
                    <span className="text-gray-500 min-w-[60px] text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 min-w-[60px] text-right">
                      {formatNumber(item.orders)} orders
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Table */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
            Loading orders...
          </div>
        )}
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load orders: {formatErrorMessage(error)}
          </div>
        )}
        {!isLoading && !isError && !hasNoOrders && <OrdersTable orders={orders} />}
        {hasNoOrders && (
          <EmptyState
            icon="orders"
            title="No orders yet"
            description="Connect Shopify to stream orders automatically, or generate sample data to explore the platform."
            actionLabel="Connect Shopify"
            actionHref="/integrations/shopify"
            secondaryActionLabel={!sampleDataStats?.has_sample_data ? "Generate Sample Data" : undefined}
            onAction={!sampleDataStats?.has_sample_data ? () => generateSampleData.mutate() : undefined}
          />
        )}
      </DashboardSection>
    </div>
  );
}
