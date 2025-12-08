"use client";

import { useState } from "react";
import {
  useAnomalyDetection,
  useAnomalyTrends,
  useMetricHealth,
  AnomalyItem,
  MetricHealth,
  Sensitivity,
  getSeverityColor,
  getAnomalyTypeIcon,
  getHealthStatusColor,
} from "@/hooks/useAnomalies";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

type ViewMode = "detection" | "health" | "trends";

const SENSITIVITY_OPTIONS: { value: Sensitivity; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "Major anomalies only" },
  { value: "medium", label: "Medium", description: "Balanced detection" },
  { value: "high", label: "High", description: "Include minor anomalies" },
];

const PLATFORM_OPTIONS = [
  { value: "", label: "All Platforms" },
  { value: "facebook", label: "Facebook Ads" },
  { value: "google_ads", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Ads" },
  { value: "snapchat", label: "Snapchat Ads" },
];

export default function AnomaliesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("detection");
  const [sensitivity, setSensitivity] = useState<Sensitivity>("medium");
  const [platform, setPlatform] = useState("");

  // Fetch data
  const { data: anomalyData, isLoading: anomalyLoading } = useAnomalyDetection(
    undefined,
    undefined,
    undefined,
    platform || undefined,
    sensitivity,
  );

  const { data: healthData, isLoading: healthLoading } = useMetricHealth(
    undefined,
    undefined,
    platform || undefined,
  );

  const { data: trendsData, isLoading: trendsLoading } = useAnomalyTrends(
    undefined,
    undefined,
    platform || undefined,
  );

  const isLoading =
    viewMode === "detection"
      ? anomalyLoading
      : viewMode === "health"
      ? healthLoading
      : trendsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Anomaly Detection
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automatically detect unusual patterns in your marketing metrics
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1 dark:border-gray-600">
          <button
            onClick={() => setViewMode("detection")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              viewMode === "detection"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Anomalies
          </button>
          <button
            onClick={() => setViewMode("health")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              viewMode === "health"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Health Check
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

        {/* Platform Filter */}
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

        {/* Sensitivity (for detection view) */}
        {viewMode === "detection" && (
          <>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Sensitivity:</span>
              <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-600">
                {SENSITIVITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSensitivity(opt.value)}
                    title={opt.description}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      sensitivity === opt.value
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Detection View */}
          {viewMode === "detection" && anomalyData && (
            <AnomalyDetectionView data={anomalyData} />
          )}

          {/* Health View */}
          {viewMode === "health" && healthData && (
            <MetricHealthView data={healthData} />
          )}

          {/* Trends View */}
          {viewMode === "trends" && trendsData && (
            <AnomalyTrendsView data={trendsData} />
          )}
        </>
      )}
    </div>
  );
}

// Anomaly Detection View Component
function AnomalyDetectionView({ data }: { data: ReturnType<typeof useAnomalyDetection>["data"] }) {
  if (!data) return null;

  const { anomalies, summary } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Anomalies
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {summary.total_anomalies}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Concerning
          </p>
          <p className="mt-1 text-3xl font-bold text-red-700 dark:text-red-400">
            {summary.concerning_anomalies}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Critical
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {summary.by_severity.critical || 0}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            High Severity
          </p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {summary.by_severity.high || 0}
          </p>
        </div>
      </div>

      {/* Message */}
      {data.message && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          {data.message}
        </div>
      )}

      {/* Anomalies List */}
      {anomalies.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detected Anomalies
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {anomalies.map((anomaly, index) => (
              <AnomalyRow key={`${anomaly.date}-${anomaly.metric}-${index}`} anomaly={anomaly} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-12 dark:border-gray-700 dark:bg-gray-800">
          <span className="text-4xl">✅</span>
          <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No anomalies detected
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            All metrics are within normal ranges
          </p>
        </div>
      )}
    </div>
  );
}

// Single Anomaly Row
function AnomalyRow({ anomaly }: { anomaly: AnomalyItem }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      {/* Icon */}
      <div className="text-2xl">{getAnomalyTypeIcon(anomaly.type)}</div>

      {/* Details */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">
            {anomaly.metric_label}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
            {anomaly.severity}
          </span>
          {anomaly.is_concerning && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              ⚠️ Needs attention
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {anomaly.description}
        </p>
      </div>

      {/* Values */}
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {formatNumber(anomaly.value)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Expected: {formatNumber(anomaly.expected_value)}
        </p>
      </div>

      {/* Date */}
      <div className="w-24 text-right text-sm text-gray-500 dark:text-gray-400">
        {anomaly.date}
      </div>
    </div>
  );
}

// Metric Health View Component
function MetricHealthView({ data }: { data: ReturnType<typeof useMetricHealth>["data"] }) {
  if (!data) return null;

  const { metrics, overall_health } = data;

  const healthColors: Record<string, string> = {
    healthy: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
    mixed: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
    warning: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
    critical: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
    unknown: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Overall Health Status
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Based on comparing recent performance to historical baseline
            </p>
          </div>
          <div className={`rounded-full px-4 py-2 text-lg font-bold ${healthColors[overall_health] || healthColors.unknown}`}>
            {overall_health.charAt(0).toUpperCase() + overall_health.slice(1)}
          </div>
        </div>
      </div>

      {/* Message */}
      {data.message && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          {data.message}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricHealthCard key={metric.metric} metric={metric} />
        ))}
      </div>
    </div>
  );
}

// Metric Health Card
function MetricHealthCard({ metric }: { metric: MetricHealth }) {
  const statusIcons: Record<string, string> = {
    stable: "➡️",
    improving: "📈",
    declining: "📉",
    critical: "🚨",
  };

  const statusBg: Record<string, string> = {
    stable: "border-gray-200 dark:border-gray-700",
    improving: "border-emerald-200 dark:border-emerald-800",
    declining: "border-yellow-200 dark:border-yellow-800",
    critical: "border-red-200 dark:border-red-800",
  };

  return (
    <div className={`rounded-xl border bg-white p-5 dark:bg-gray-800 ${statusBg[metric.status]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {metric.label}
        </p>
        <span className="text-xl">{statusIcons[metric.status]}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
        {formatNumber(metric.current_value)}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className={getHealthStatusColor(metric.status)}>
          {metric.change_percent > 0 ? "+" : ""}
          {metric.change_percent.toFixed(1)}%
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          vs {formatNumber(metric.previous_value)}
        </span>
      </div>
      <p className="mt-2 text-xs font-medium capitalize text-gray-500 dark:text-gray-400">
        {metric.status}
      </p>
    </div>
  );
}

// Anomaly Trends View
function AnomalyTrendsView({ data }: { data: ReturnType<typeof useAnomalyTrends>["data"] }) {
  if (!data) return null;

  const { timeline, total_days_with_anomalies } = data;

  const maxCount = Math.max(...timeline.map((t) => t.count), 1);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Anomaly Timeline
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {total_days_with_anomalies} days with anomalies in the period
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      {timeline.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 font-medium text-gray-900 dark:text-white">Daily Anomaly Count</h4>
          <div className="h-48 overflow-x-auto">
            <div className="flex h-full items-end gap-1" style={{ minWidth: `${timeline.length * 24}px` }}>
              {timeline.map((point, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-4 rounded-t transition-all ${
                      point.concerning > 0 ? "bg-red-400" : "bg-emerald-400"
                    }`}
                    style={{ height: `${(point.count / maxCount) * 100}%`, minHeight: "4px" }}
                    title={`${point.date}: ${point.count} anomalies`}
                  />
                  <span className="text-xs text-gray-400 [writing-mode:vertical-lr]">
                    {point.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-12 dark:border-gray-700 dark:bg-gray-800">
          <span className="text-4xl">📊</span>
          <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No anomaly trends available
          </p>
        </div>
      )}

      {/* Timeline Table */}
      {timeline.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Detailed Timeline</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Anomalies
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Concerning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {timeline.map((point, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {point.date}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                      {point.count}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <span className={point.concerning > 0 ? "text-red-600 dark:text-red-400" : "text-gray-500"}>
                        {point.concerning}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {point.anomalies.map((a) => a.metric).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
