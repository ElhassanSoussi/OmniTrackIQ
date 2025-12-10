"use client";

import { useState } from "react";
import { useAgencyDashboard, useClientBenchmarks, ClientBenchmark } from "@/hooks/useAgency";
import { useBilling } from "@/hooks/useBilling";
import { useRouter } from "next/navigation";
import Link from "next/link";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          {icon}
        </div>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trend.value >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {formatPercent(trend.value)}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{title}</p>
    </div>
  );
}

function BenchmarkTable({ benchmarks }: { benchmarks: ClientBenchmark[] }) {
  if (benchmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No benchmark data</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add clients and connect integrations to see performance benchmarks.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Rank
            </th>
            <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Client
            </th>
            <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Revenue
            </th>
            <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Spend
            </th>
            <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              ROAS
            </th>
            <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Orders
            </th>
            <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              AOV
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {benchmarks.map((benchmark, index) => (
            <tr key={benchmark.client_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : index === 1
                      ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      : index === 2
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {benchmark.performance_rank}
                </span>
              </td>
              <td className="py-3">
                <Link
                  href={`/agency/clients/${benchmark.client_id}`}
                  className="font-medium text-gray-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                >
                  {benchmark.client_name}
                </Link>
              </td>
              <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                {formatCurrency(benchmark.revenue)}
              </td>
              <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                {formatCurrency(benchmark.spend)}
              </td>
              <td className="py-3 text-right">
                <span
                  className={`font-medium ${
                    benchmark.roas >= 3
                      ? "text-green-600 dark:text-green-400"
                      : benchmark.roas >= 2
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {benchmark.roas.toFixed(2)}x
                </span>
              </td>
              <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                {benchmark.orders.toLocaleString()}
              </td>
              <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                {formatCurrency(benchmark.aov)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AgencyDashboardPage() {
  const router = useRouter();
  const { billing, loading: billingLoading } = useBilling();
  const [dateRange] = useState({ from: undefined, to: undefined });
  
  const { data: dashboard, isLoading: dashboardLoading } = useAgencyDashboard(
    dateRange.from,
    dateRange.to
  );
  const { data: benchmarksData, isLoading: benchmarksLoading } = useClientBenchmarks(
    dateRange.from,
    dateRange.to
  );

  // Check for agency plan
  const isAgencyPlan = billing?.plan === "agency" || billing?.plan === "enterprise";

  if (!billingLoading && !isAgencyPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agency Features</h2>
        <p className="mt-2 max-w-md text-gray-500 dark:text-gray-400">
          Upgrade to the Agency plan to manage multiple client accounts, create white-label reports,
          and access cross-client analytics.
        </p>
        <button
          onClick={() => router.push("/billing")}
          className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Upgrade to Agency
        </button>
      </div>
    );
  }

  const isLoading = dashboardLoading || benchmarksLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agency Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cross-client overview and performance benchmarks
          </p>
        </div>
        <Link
          href="/agency/clients"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </Link>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Clients"
            value={dashboard?.total_clients || 0}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Active Clients"
            value={dashboard?.active_clients || 0}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(dashboard?.total_revenue || 0)}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Avg. ROAS"
            value={`${(dashboard?.total_roas || 0).toFixed(2)}x`}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>
      )}

      {/* Clients by Status */}
      {dashboard?.clients_by_status && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clients by Status</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {Object.entries(dashboard.clients_by_status).map(([status, count]) => (
              <div
                key={status}
                className={`rounded-lg px-4 py-2 ${
                  status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : status === "paused"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : status === "pending_setup"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                <span className="text-xl font-bold">{count}</span>
                <span className="ml-2 text-sm capitalize">{status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Benchmarks */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance Benchmarks
          </h2>
          <Link
            href="/agency/benchmarks"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            View All →
          </Link>
        </div>
        {benchmarksLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          </div>
        ) : (
          <BenchmarkTable benchmarks={benchmarksData?.benchmarks || []} />
        )}
      </div>

      {/* Top Performing Clients */}
      {dashboard?.top_performing_clients && dashboard.top_performing_clients.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Top Performing Clients
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dashboard.top_performing_clients.map((client, index) => (
              <Link
                key={client.id}
                href={`/agency/clients/${client.id}`}
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-gray-700 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : index === 1
                      ? "bg-gray-200 text-gray-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(client.revenue)} • {client.roas.toFixed(2)}x ROAS
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
