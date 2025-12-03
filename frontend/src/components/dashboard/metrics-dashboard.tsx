"use client";

import { useMemo, useState } from "react";
import KPIGrid from "@/components/dashboard/kpi-grid";
import OrdersTable, { OrderRow } from "@/components/dashboard/orders-table";
import SummaryChart from "@/components/dashboard/summary-chart";
import { useMetrics } from "@/hooks/useMetrics";
import { useOrders } from "@/hooks/useOrders";

function formatDateInput(value: Date) {
  return value.toISOString().split("T")[0];
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export default function MetricsDashboard() {
  const today = useMemo(() => new Date(), []);
  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setDate(today.getDate() - 7);
    return d;
  }, [today]);

  const [from, setFrom] = useState(formatDateInput(defaultFrom));
  const [to, setTo] = useState(formatDateInput(today));

  const {
    data: summary,
    isLoading: summaryLoading,
    isError,
    refetch,
  } = useMetrics(from, to);

  const { data: orders, isLoading: ordersLoading } = useOrders(from, to, 5);

  const cards = [
    {
      label: "Revenue",
      value: summary ? formatCurrency(summary.revenue) : "—",
      subtext: summary ? `${formatNumber(summary.orders)} orders` : "Waiting for data",
    },
    {
      label: "Ad Spend",
      value: summary ? formatCurrency(summary.spend) : "—",
      subtext: summary ? `${formatNumber(summary.clicks)} clicks` : undefined,
    },
    {
      label: "ROAS",
      value: summary ? `${summary.roas.toFixed(1)}x` : "—",
      subtext: summary ? `${formatCurrency(summary.profit)} profit` : undefined,
    },
    {
      label: "Impressions",
      value: summary ? formatNumber(summary.impressions) : "—",
      subtext: summary ? `${formatNumber(summary.conversions)} conversions` : undefined,
    },
  ];

  const ordersRows: OrderRow[] | undefined = orders?.items?.map((row: any) => ({
    id: row.id,
    date_time: row.date_time,
    amount: row.total_amount,
    currency: row.currency,
    source: row.source_platform,
    utm_source: row.utm_source,
    utm_campaign: row.utm_campaign,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Metrics dashboard</h1>
          <p className="text-sm text-slate-400">Change the range to reload spend, revenue, and conversion data.</p>
          {isError && <p className="text-sm text-amber-400">Unable to load metrics. Check API connection and try again.</p>}
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-slate-200">
          <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
            <span className="text-slate-400">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-transparent focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
            <span className="text-slate-400">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-transparent focus:outline-none"
            />
          </label>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Refresh
          </button>
        </div>
      </div>

      <KPIGrid items={cards} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SummaryChart daily={summary?.daily} loading={summaryLoading} />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="text-sm font-semibold text-slate-100">Highlights</div>
          <div className="mt-3 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
              <span>Orders</span>
              <span className="font-semibold text-white">{summary ? formatNumber(summary.orders) : "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
              <span>Clicks</span>
              <span className="font-semibold text-white">{summary ? formatNumber(summary.clicks) : "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
              <span>Impressions</span>
              <span className="font-semibold text-white">{summary ? formatNumber(summary.impressions) : "—"}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
              <span>Conversions</span>
              <span className="font-semibold text-white">{summary ? formatNumber(summary.conversions) : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <OrdersTable orders={ordersRows} loading={ordersLoading || summaryLoading} />
    </div>
  );
}
