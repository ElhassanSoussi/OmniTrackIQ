"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { getDateRange, DateRangeValue } from "@/lib/date-range";
import { formatCurrency, formatNumber } from "@/lib/format";

interface Order {
  id: string;
  external_order_id: string;
  date_time: string;
  total_amount: number;
  currency: string;
  utm_source: string | null;
  utm_campaign: string | null;
  source_platform: string | null;
}

interface OrdersResponse {
  total: number;
  items: Order[];
}

interface DailyData {
  date: string;
  revenue?: number;
  orders?: number;
  spend?: number;
  roas?: number;
}

interface MetricsSummary {
  revenue: number;
  spend: number;
  profit: number;
  roas: number;
  orders: number;
  aov: number;
}

const SOURCE_COLORS: Record<string, { bg: string; badge: string }> = {
  facebook: { bg: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  fb: { bg: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  google: { bg: "bg-red-500", badge: "bg-red-100 text-red-700" },
  tiktok: { bg: "bg-gray-900", badge: "bg-gray-100 text-gray-700" },
  snapchat: { bg: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700" },
  pinterest: { bg: "bg-red-600", badge: "bg-red-100 text-red-700" },
  email: { bg: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  organic: { bg: "bg-green-500", badge: "bg-green-100 text-green-700" },
  direct: { bg: "bg-purple-500", badge: "bg-purple-100 text-purple-700" },
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

export default function RevenueAnalyticsPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const [source, setSource] = useState<string>("all");
  const { from, to } = getDateRange(range);

  const { data: summary, isLoading: summaryLoading } = useQuery<MetricsSummary>({
    queryKey: ["metrics-summary", from, to],
    queryFn: () => apiFetch(`/metrics/summary?from=${from}&to=${to}`) as Promise<MetricsSummary>,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery<OrdersResponse>({
    queryKey: ["orders-revenue", from, to, source],
    queryFn: () => {
      const params = new URLSearchParams({ from, to, limit: "100" });
      if (source !== "all") params.set("utm_source", source);
      return apiFetch(`/metrics/orders?${params}`) as Promise<OrdersResponse>;
    },
  });

  const { data: dailyData, isLoading: dailyLoading } = useQuery<DailyData[]>({
    queryKey: ["daily-revenue", from, to],
    queryFn: () => apiFetch(`/metrics/daily?from=${from}&to=${to}&metrics=revenue&metrics=orders&metrics=spend&metrics=roas`) as Promise<DailyData[]>,
  });

  // Calculate revenue by source
  const revenueBySource = useMemo(() => {
    if (!ordersData?.items) return [];
    
    const sourceMap: Record<string, { source: string; revenue: number; orders: number }> = {};
    
    ordersData.items.forEach((order) => {
      const src = order.utm_source || "direct";
      if (!sourceMap[src]) {
        sourceMap[src] = { source: src, revenue: 0, orders: 0 };
      }
      sourceMap[src].revenue += order.total_amount;
      sourceMap[src].orders += 1;
    });
    
    const total = Object.values(sourceMap).reduce((sum, s) => sum + s.revenue, 0) || 1;
    
    return Object.values(sourceMap)
      .map((s) => ({
        ...s,
        percentage: (s.revenue / total) * 100,
        aov: s.orders > 0 ? s.revenue / s.orders : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [ordersData]);

  // Available sources from data
  const availableSources = useMemo(() => {
    if (!ordersData?.items) return [];
    const sources = [...new Set(ordersData.items.map((o) => o.utm_source).filter(Boolean))];
    return sources.sort() as string[];
  }, [ordersData]);

  // Format datetime for display
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/analytics" className="hover:text-emerald-600">Analytics</Link>
            <span>/</span>
            <span className="text-gray-900">Revenue</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analysis</h1>
          <p className="mt-1 text-gray-500">Order attribution, revenue trends, and profitability metrics</p>
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

      {/* Revenue Summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-white p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-100 p-2">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600">Revenue</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-700">
            {summaryLoading ? "..." : formatCurrency(summary?.revenue || 0)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Ad Spend</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {summaryLoading ? "..." : formatCurrency(summary?.spend || 0)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Profit</p>
          <p className={`mt-2 text-2xl font-bold ${(summary?.profit || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {summaryLoading ? "..." : formatCurrency(summary?.profit || 0)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">ROAS</p>
          <p className={`mt-2 text-2xl font-bold ${(summary?.roas || 0) >= 3 ? "text-emerald-600" : (summary?.roas || 0) >= 2 ? "text-yellow-600" : "text-gray-900"}`}>
            {summaryLoading ? "..." : `${(summary?.roas || 0).toFixed(2)}x`}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Orders</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {summaryLoading ? "..." : formatNumber(summary?.orders || 0)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">AOV</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {summaryLoading ? "..." : formatCurrency(summary?.aov || 0)}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Revenue & ROAS Trend</h2>
          <p className="mt-1 text-sm text-gray-500">Daily revenue performance over time</p>
          
          {dailyLoading ? (
            <div className="mt-6 h-64 animate-pulse rounded bg-gray-100" />
          ) : dailyData && dailyData.length > 0 ? (
            <div className="mt-6">
              {/* Legend */}
              <div className="mb-4 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-gray-600">ROAS</span>
                </div>
              </div>
              
              {/* Chart */}
              <div className="flex h-48 items-end gap-1">
                {dailyData.slice(-30).map((day) => {
                  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue || 0)) || 1;
                  const height = ((day.revenue || 0) / maxRevenue) * 100;
                  return (
                    <div
                      key={day.date}
                      className="group relative flex-1 min-w-[4px]"
                    >
                      <div
                        className="w-full rounded-t bg-emerald-500 transition-colors hover:bg-emerald-600"
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-3 py-2 text-xs text-white group-hover:block z-10">
                        <p className="font-semibold">{day.date}</p>
                        <p>Revenue: {formatCurrency(day.revenue || 0)}</p>
                        <p>ROAS: {(day.roas || 0).toFixed(2)}x</p>
                        <p>Orders: {day.orders || 0}</p>
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
            <div className="mt-6 h-64 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
              <p>No revenue data available</p>
            </div>
          )}
        </div>

        {/* Revenue by Source */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Revenue by Source</h2>
          <p className="mt-1 text-sm text-gray-500">Attribution breakdown by UTM source</p>
          
          {ordersLoading ? (
            <div className="mt-6 animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded bg-gray-100" />)}
            </div>
          ) : revenueBySource && revenueBySource.length > 0 ? (
            <div className="mt-6 space-y-4">
              {revenueBySource.slice(0, 6).map((source) => (
                <div key={source.source}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${SOURCE_COLORS[source.source]?.bg || "bg-gray-400"}`} />
                      <span className="text-sm font-medium text-gray-900">
                        {SOURCE_LABELS[source.source] || source.source}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(source.revenue)} ({source.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full ${SOURCE_COLORS[source.source]?.bg || "bg-gray-400"}`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{formatNumber(source.orders)} orders</span>
                    <span>AOV: {formatCurrency(source.aov)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg bg-gray-50 p-8 text-center text-gray-500">
              <p>No source data available</p>
              <p className="mt-1 text-sm">Orders will appear with attribution data</p>
            </div>
          )}
        </div>

        {/* AOV by Source */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">AOV by Source</h2>
          <p className="mt-1 text-sm text-gray-500">Average order value comparison</p>
          
          {ordersLoading ? (
            <div className="mt-6 animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded bg-gray-100" />)}
            </div>
          ) : revenueBySource && revenueBySource.length > 0 ? (
            <div className="mt-6 space-y-3">
              {revenueBySource.slice(0, 6).map((source, index) => {
                const maxAOV = Math.max(...revenueBySource.map((s) => s.aov)) || 1;
                const barWidth = (source.aov / maxAOV) * 100;
                const avgAOV = summary?.aov || 0;
                const isAboveAvg = source.aov >= avgAOV;
                
                return (
                  <div key={source.source} className="flex items-center gap-4">
                    <div className="w-24 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {SOURCE_LABELS[source.source] || source.source}
                      </span>
                    </div>
                    <div className="flex-1 h-8 bg-gray-100 rounded overflow-hidden relative">
                      <div
                        className={`h-full ${isAboveAvg ? "bg-emerald-500" : "bg-blue-500"}`}
                        style={{ width: `${barWidth}%` }}
                      />
                      {/* Average line */}
                      {avgAOV > 0 && (
                        <div
                          className="absolute top-0 h-full w-0.5 bg-gray-400"
                          style={{ left: `${(avgAOV / maxAOV) * 100}%` }}
                          title={`Average: ${formatCurrency(avgAOV)}`}
                        />
                      )}
                    </div>
                    <div className="w-20 text-right">
                      <span className={`text-sm font-semibold ${isAboveAvg ? "text-emerald-600" : "text-blue-600"}`}>
                        {formatCurrency(source.aov)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <div className="h-3 w-0.5 bg-gray-400" />
                <span>Average AOV: {formatCurrency(summary?.aov || 0)}</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-lg bg-gray-50 p-8 text-center text-gray-500">
              <p>No AOV data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500">Latest orders with attribution</p>
            </div>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              aria-label="Filter by source"
            >
              <option value="all">All Sources</option>
              {availableSources.map((s) => (
                <option key={s} value={s}>{SOURCE_LABELS[s] || s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {ordersLoading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded bg-gray-100" />)}
              </div>
            </div>
          ) : ordersData?.items && ordersData.items.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Order ID</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Source</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Campaign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordersData.items.slice(0, 20).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">#{order.external_order_id}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDateTime(order.date_time)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      {order.utm_source ? (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${SOURCE_COLORS[order.utm_source]?.badge || "bg-gray-100 text-gray-700"}`}>
                          {SOURCE_LABELS[order.utm_source] || order.utm_source}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                      {order.utm_campaign || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-4 text-gray-600">No orders found</p>
              <p className="mt-1 text-sm text-gray-500">Connect your e-commerce platform to see orders</p>
              <Link href="/integrations" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                Connect Integrations
              </Link>
            </div>
          )}
        </div>

        {ordersData?.total && ordersData.total > 0 && (
          <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500">
            Showing {Math.min(ordersData.items?.length || 0, 20)} of {ordersData.total} orders
          </div>
        )}
      </div>
    </div>
  );
}
