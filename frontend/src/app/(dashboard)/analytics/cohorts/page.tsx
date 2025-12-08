"use client";

import { useState } from "react";
import {
  useRetentionCohorts,
  useChannelCohorts,
  CohortPeriod,
} from "@/hooks/useCohorts";
import { formatCurrency, formatPercent } from "@/lib/format";

type ViewMode = "retention" | "channel";

const PERIOD_OPTIONS: { value: CohortPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

// Color scale for retention heatmap
function getRetentionColor(rate: number): string {
  if (rate >= 80) return "bg-emerald-500 text-white";
  if (rate >= 60) return "bg-emerald-400 text-white";
  if (rate >= 40) return "bg-emerald-300 text-gray-900";
  if (rate >= 20) return "bg-emerald-200 text-gray-900";
  if (rate > 0) return "bg-emerald-100 text-gray-700";
  return "bg-gray-50 text-gray-400";
}

export default function CohortsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("retention");
  const [period, setPeriod] = useState<CohortPeriod>("monthly");
  const [maxPeriods, setMaxPeriods] = useState(6);

  const { data: retentionData, isLoading: retentionLoading } = useRetentionCohorts(
    undefined,
    undefined,
    period,
    maxPeriods,
  );

  const { data: channelData, isLoading: channelLoading } = useChannelCohorts(
    undefined,
    undefined,
    period,
  );

  const isLoading = viewMode === "retention" ? retentionLoading : channelLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cohort Analysis</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analyze customer retention and lifetime value over time
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setViewMode("retention")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              viewMode === "retention"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Retention
          </button>
          <button
            onClick={() => setViewMode("channel")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              viewMode === "channel"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            By Channel
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* Period Select */}
        <div>
          <label htmlFor="period-select" className="sr-only">Period</label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as CohortPeriod)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {viewMode === "retention" && (
          <>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <label htmlFor="max-periods" className="sr-only">Periods to show</label>
              <select
                id="max-periods"
                value={maxPeriods}
                onChange={(e) => setMaxPeriods(Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={3}>3 periods</option>
                <option value={6}>6 periods</option>
                <option value={9}>9 periods</option>
                <option value={12}>12 periods</option>
              </select>
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      ) : viewMode === "retention" && retentionData ? (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-medium text-gray-500">Total Customers</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {retentionData.total_customers.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-medium text-gray-500">Cohorts Analyzed</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {retentionData.cohorts.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-medium text-gray-500">Avg Month 1 Retention</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {retentionData.avg_retention[1]?.avg_retention_rate || 0}%
              </p>
            </div>
          </div>

          {/* Retention Heatmap */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Retention Cohorts</h2>
              <p className="text-sm text-gray-500">
                Each row represents a cohort, columns show retention rate in subsequent periods
              </p>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-medium text-gray-500">
                    <th className="px-3 py-2 text-left">Cohort</th>
                    <th className="px-3 py-2 text-right">Size</th>
                    {Array.from({ length: maxPeriods + 1 }, (_, i) => (
                      <th key={i} className="px-3 py-2 text-center min-w-[60px]">
                        {period === "monthly" ? `M${i}` : period === "weekly" ? `W${i}` : `D${i}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {retentionData.cohorts.map((cohort) => (
                    <tr key={cohort.cohort} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">
                        {cohort.cohort}
                      </td>
                      <td className="px-3 py-2 text-sm text-right text-gray-600">
                        {cohort.cohort_size}
                      </td>
                      {cohort.periods.slice(0, maxPeriods + 1).map((p, idx) => (
                        <td key={idx} className="px-1 py-1">
                          <div
                            className={`mx-auto w-14 rounded px-2 py-1 text-center text-xs font-medium ${getRetentionColor(p.retention_rate)}`}
                            title={`${p.active_customers} customers, ${formatCurrency(p.revenue)} revenue`}
                          >
                            {p.retention_rate}%
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="border-t border-gray-100 px-6 py-3">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Retention:</span>
                <div className="flex items-center gap-1">
                  <div className="h-4 w-8 rounded bg-gray-50"></div>
                  <span>0%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-4 w-8 rounded bg-emerald-200"></div>
                  <span>20%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-4 w-8 rounded bg-emerald-400"></div>
                  <span>60%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-4 w-8 rounded bg-emerald-500"></div>
                  <span>80%+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Average Retention Trend */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Retention by Period</h3>
            <div className="flex items-end gap-2 h-32">
              {retentionData.avg_retention.slice(0, maxPeriods + 1).map((item) => (
                <div key={item.period} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-emerald-500 rounded-t transition-all"
                    style={{ height: `${item.avg_retention_rate}%` }}
                  />
                  <span className="text-xs text-gray-500">
                    {period === "monthly" ? `M${item.period}` : `W${item.period}`}
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {item.avg_retention_rate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : viewMode === "channel" && channelData ? (
        <>
          {/* Channel Cohorts */}
          <div className="space-y-6">
            {channelData.channels.map((channel) => (
              <div key={channel.channel} className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {channel.channel.replace("_", " ")}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {channel.total_customers} customers, {channel.avg_retention}% avg retention
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-3 text-left">Cohort</th>
                        <th className="px-6 py-3 text-right">Customers</th>
                        <th className="px-6 py-3 text-right">Returning</th>
                        <th className="px-6 py-3 text-right">Retention</th>
                        <th className="px-6 py-3 text-right">Revenue</th>
                        <th className="px-6 py-3 text-right">Avg LTV</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {channel.cohorts.map((cohort) => (
                        <tr key={cohort.cohort} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">
                            {cohort.cohort}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-600">
                            {cohort.total_customers}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-600">
                            {cohort.returning_customers}
                          </td>
                          <td className="px-6 py-3 text-sm text-right">
                            <span className={`font-medium ${cohort.retention_rate >= 30 ? "text-emerald-600" : "text-gray-600"}`}>
                              {cohort.retention_rate}%
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">
                            {formatCurrency(cohort.total_revenue)}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">
                            {formatCurrency(cohort.avg_ltv)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No cohort data available</p>
        </div>
      )}
    </div>
  );
}
