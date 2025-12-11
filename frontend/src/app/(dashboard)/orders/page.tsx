"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DashboardSection, DateRangeToggle, DateRangeValue, OrdersTable } from "@/components/dashboard";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricTooltip } from "@/components/ui/metric-tooltip";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { OrderRow } from "@/components/dashboard/orders-table";
import { useOrdersSummary, useOrdersList, OrderListItem } from "@/hooks/useOrders";
import { useSampleDataStats, useGenerateSampleData } from "@/hooks/useSampleData";
import { getDateRange } from "@/lib/date-range";
import { formatCurrency, formatNumber, formatErrorMessage } from "@/lib/format";
import { trackDashboardView } from "@/lib/analytics";

const SOURCE_COLORS: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  fb: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  google: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  tiktok: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  snapchat: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  pinterest: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  email: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  organic: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  direct: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;
  
  const { from, to } = getDateRange(range);

  // Track dashboard view (once per session)
  useEffect(() => {
    trackDashboardView("orders");
  }, []);
  
  // Use the new paginated orders list endpoint
  const { data: ordersData, isLoading, isError, error } = useOrdersList(from, to, {
    channel: sourceFilter || undefined,
    search: searchQuery || undefined,
    page: currentPage,
    pageSize,
  });
  
  const { data: summaryData, isLoading: summaryLoading } = useOrdersSummary(from, to);
  const { data: sampleDataStats } = useSampleDataStats();
  const generateSampleData = useGenerateSampleData();

  const orders: OrderRow[] = useMemo(() => {
    if (!ordersData?.items) return [];
    return ordersData.items.map((o: OrderListItem) => ({
      id: o.external_order_id || o.id,
      date: o.date_time ? new Date(o.date_time).toLocaleString() : "",
      amount: formatCurrency(o.total_amount, o.currency || "USD"),
      source: o.source_platform || "unknown",
      utm_source: o.utm_source || o.attributed_channel,
      utm_campaign: o.utm_campaign || o.attributed_campaign,
    }));
  }, [ordersData]);

  // Pagination info
  const totalPages = ordersData ? Math.ceil(ordersData.total_count / pageSize) : 0;

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
        color: SOURCE_COLORS[source.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [summaryData]);

  // Daily data for mini-chart
  const dailyData = useMemo(() => {
    if (!summaryData?.daily) return [];
    return summaryData.daily;
  }, [summaryData]);

  const hasNoOrders = !isLoading && !isError && orders.length === 0 && !searchQuery && !sourceFilter;

  // Reset to page 1 when filters change
  const handleFilterChange = (value: string) => {
    setSourceFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <DashboardSection
        title="Orders"
        description="Revenue attribution and order analytics with UTM tracking."
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search order ID..."
              className="rounded-md border border-gh-border px-3 py-2 text-sm bg-gh-canvas-default focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark w-40 sm:w-48"
            />
            <select
              value={sourceFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="rounded-md border border-gh-border px-3 py-2 text-sm bg-gh-canvas-default focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark"
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
          <div className="rounded-md border border-gh-border bg-gh-canvas-default p-5 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
            <MetricTooltip metric="revenue">
              <p className="text-sm font-medium text-gh-text-secondary dark:text-gh-text-secondary-dark">Total Revenue</p>
            </MetricTooltip>
            <p className="mt-2 text-2xl font-bold text-brand-600 dark:text-brand-400">
              {summaryLoading ? "..." : formatCurrency(summaryData?.total_revenue || 0)}
            </p>
          </div>
          <div className="rounded-md border border-gh-border bg-gh-canvas-default p-5 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
            <MetricTooltip metric="orders">
              <p className="text-sm font-medium text-gh-text-secondary dark:text-gh-text-secondary-dark">Total Orders</p>
            </MetricTooltip>
            <p className="mt-2 text-2xl font-bold text-gh-text-primary dark:text-gh-text-primary-dark">
              {summaryLoading ? "..." : formatNumber(summaryData?.total_orders || 0)}
            </p>
          </div>
          <div className="rounded-md border border-gh-border bg-gh-canvas-default p-5 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
            <MetricTooltip metric="aov">
              <p className="text-sm font-medium text-gh-text-secondary dark:text-gh-text-secondary-dark">Average Order Value</p>
            </MetricTooltip>
            <p className="mt-2 text-2xl font-bold text-gh-text-primary dark:text-gh-text-primary-dark">
              {summaryLoading ? "..." : formatCurrency(summaryData?.aov || 0)}
            </p>
          </div>
          <div className="rounded-md border border-gh-border bg-gh-canvas-default p-5 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
            <p className="text-sm font-medium text-gh-text-secondary dark:text-gh-text-secondary-dark">Attribution Sources</p>
            <p className="mt-2 text-2xl font-bold text-gh-text-primary dark:text-gh-text-primary-dark">
              {summaryLoading ? "..." : availableSources.length}
            </p>
          </div>
        </div>

        {/* Daily Mini-Chart */}
        {dailyData.length > 0 && (
          <div className="mb-6 rounded-md border border-gh-border bg-gh-canvas-default p-5 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Orders Over Time</h3>
                <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Daily orders and revenue</p>
              </div>
            </div>
            <div className="h-32 flex items-end justify-between gap-1">
              {dailyData.slice(-21).map((point, idx) => {
                const maxRevenue = Math.max(...dailyData.map(d => d.revenue)) || 1;
                const height = (point.revenue / maxRevenue) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-emerald-500 dark:bg-emerald-400 rounded-t transition-all hover:bg-emerald-600 dark:hover:bg-emerald-300 cursor-pointer"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate w-full text-center">
                      {new Date(point.date).getDate()}
                    </span>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div>{point.date}</div>
                      <div>{formatNumber(point.orders)} orders</div>
                      <div>{formatCurrency(point.revenue)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Attribution Breakdown */}
        {attributionData.length > 0 && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Attribution</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last-touch attribution by source</p>
              </div>
              <Link 
                href="/analytics/revenue" 
                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
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
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium text-gray-900 dark:text-white min-w-[80px] text-right">
                      {formatCurrency(item.revenue)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 min-w-[50px] text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 min-w-[70px] text-right">
                      {formatNumber(item.orders)} orders
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Table */}
        {isLoading && <TableSkeleton rows={5} />}
        
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            Failed to load orders: {formatErrorMessage(error)}
          </div>
        )}
        
        {!isLoading && !isError && orders.length > 0 && (
          <>
            <OrdersTable orders={orders} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, ordersData?.total_count || 0)} of {ordersData?.total_count || 0} orders
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        {!isLoading && !isError && orders.length === 0 && (searchQuery || sourceFilter) && (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">No orders found matching your filters.</p>
            <button
              onClick={() => { setSearchQuery(""); setSourceFilter(""); setCurrentPage(1); }}
              className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
        
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
