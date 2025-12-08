"use client";

import { useState } from "react";
import {
  useFunnelData,
  useFunnelComparison,
  useFunnelTrends,
  FunnelCompareBy,
  FunnelGranularity,
  FunnelComparisonResponse,
  FunnelTimePeriodComparison,
} from "@/hooks/useFunnel";
import {
  FunnelChart,
  CompactFunnel,
  FunnelSummaryCards,
  ComparisonSummary,
  FunnelTrendsChart,
  FunnelTrendsTable,
} from "@/components/funnel";

type ViewMode = "overview" | "comparison" | "trends";

const PLATFORM_OPTIONS = [
  { value: "", label: "All Platforms" },
  { value: "facebook", label: "Facebook Ads" },
  { value: "google_ads", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "snapchat", label: "Snapchat Ads" },
];

export default function FunnelPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [platform, setPlatform] = useState("");
  const [compareBy, setCompareBy] = useState<FunnelCompareBy>("platform");
  const [granularity, setGranularity] = useState<FunnelGranularity>("daily");

  // Fetch funnel data
  const { data: funnelData, isLoading: funnelLoading } = useFunnelData(
    undefined,
    undefined,
    platform || undefined,
  );

  // Fetch comparison data
  const { data: comparisonData, isLoading: comparisonLoading } = useFunnelComparison(
    undefined,
    undefined,
    compareBy,
  );

  // Fetch trends data
  const { data: trendsData, isLoading: trendsLoading } = useFunnelTrends(
    undefined,
    undefined,
    granularity,
  );

  const isLoading =
    viewMode === "overview"
      ? funnelLoading
      : viewMode === "comparison"
      ? comparisonLoading
      : trendsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Funnel Analysis
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track customer journey from ad impressions to purchases
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1 dark:border-gray-600">
          <button
            onClick={() => setViewMode("overview")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              viewMode === "overview"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode("comparison")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              viewMode === "comparison"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Comparison
          </button>
          <button
            onClick={() => setViewMode("trends")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              viewMode === "trends"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Trends
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-600" />

        {/* Platform Filter (for overview) */}
        {viewMode === "overview" && (
          <div>
            <label htmlFor="platform-select" className="sr-only">
              Platform
            </label>
            <select
              id="platform-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Compare By (for comparison view) */}
        {viewMode === "comparison" && (
          <div>
            <label htmlFor="compare-by" className="sr-only">
              Compare By
            </label>
            <select
              id="compare-by"
              value={compareBy}
              onChange={(e) => setCompareBy(e.target.value as FunnelCompareBy)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="platform">By Platform</option>
              <option value="time_period">vs Previous Period</option>
            </select>
          </div>
        )}

        {/* Granularity (for trends view) */}
        {viewMode === "trends" && (
          <div>
            <label htmlFor="granularity" className="sr-only">
              Granularity
            </label>
            <select
              id="granularity"
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as FunnelGranularity)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Overview View */}
          {viewMode === "overview" && funnelData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <FunnelSummaryCards summary={funnelData.summary} />

              {/* Funnel Visualization */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Conversion Funnel
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {funnelData.date_range.from} to {funnelData.date_range.to}
                  </span>
                </div>
                <FunnelChart stages={funnelData.stages} />
              </div>

              {/* Funnel Details Table */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Stage Details
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Stage
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Users
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          % of Total
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Drop-off
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Drop Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                      {funnelData.stages.map((stage) => (
                        <tr key={stage.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {stage.name}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                            {stage.value.toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                            {stage.percentage.toFixed(2)}%
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-red-600 dark:text-red-400">
                            {stage.drop_off > 0 ? `-${stage.drop_off.toLocaleString()}` : "-"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-red-600 dark:text-red-400">
                            {stage.drop_off_rate > 0 ? `${stage.drop_off_rate.toFixed(1)}%` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Comparison View */}
          {viewMode === "comparison" && comparisonData && (
            <div className="space-y-6">
              {compareBy === "time_period" ? (
                // Time Period Comparison
                <TimePeriodComparison data={comparisonData as unknown as FunnelTimePeriodComparison} />
              ) : (
                // Platform Comparison
                <PlatformComparison data={comparisonData as unknown as FunnelComparisonResponse} />
              )}
            </div>
          )}

          {/* Trends View */}
          {viewMode === "trends" && trendsData && (
            <div className="space-y-6">
              {/* Trends Charts */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Funnel Trends ({trendsData.granularity})
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {trendsData.date_range.from} to {trendsData.date_range.to}
                  </span>
                </div>
                <FunnelTrendsChart trends={trendsData.trends} />
              </div>

              {/* Trends Table */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detailed Trends Data
                  </h3>
                </div>
                <FunnelTrendsTable trends={trendsData.trends} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Platform Comparison Component
function PlatformComparison({ data }: { data: FunnelComparisonResponse }) {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {data.comparisons.map((comparison) => (
          <div
            key={comparison.segment}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {comparison.segment_label}
              </h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {comparison.summary.overall_conversion_rate.toFixed(4)}% conv.
              </span>
            </div>
            <CompactFunnel stages={comparison.stages} label="" />
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Purchases</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {comparison.summary.total_purchases.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  ${comparison.summary.total_revenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// Time Period Comparison Component
function TimePeriodComparison({ data }: { data: FunnelTimePeriodComparison }) {
  return (
    <>
      {/* Summary Comparison Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Period Comparison
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data.current_period.from} - {data.current_period.to} vs{" "}
            {data.previous_period.from} - {data.previous_period.to}
          </p>
        </div>
        <ComparisonSummary
          current={data.current_period.summary}
          previous={data.previous_period.summary}
          changes={data.changes}
        />
      </div>

      {/* Side-by-side Funnels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Current Period
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({data.current_period.from} - {data.current_period.to})
            </span>
          </h3>
          <FunnelChart stages={data.current_period.stages} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
            Previous Period
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              ({data.previous_period.from} - {data.previous_period.to})
            </span>
          </h3>
          <FunnelChart stages={data.previous_period.stages} />
        </div>
      </div>
    </>
  );
}
