"use client";

import { useState } from "react";
import {
  useAttribution,
  useConversionPaths,
  AttributionModel,
  ATTRIBUTION_MODELS,
} from "@/hooks/useAttribution";
import { formatCurrency, formatNumber } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";

const CHANNEL_COLORS: Record<string, string> = {
  facebook: "bg-blue-500",
  google_ads: "bg-red-500",
  tiktok: "bg-pink-500",
  instagram: "bg-purple-500",
  email: "bg-yellow-500",
  direct: "bg-gray-500",
  organic: "bg-green-500",
  referral: "bg-indigo-500",
};

function getChannelColor(channel: string): string {
  return CHANNEL_COLORS[channel.toLowerCase()] || "bg-slate-500";
}

export default function AttributionPage() {
  const [model, setModel] = useState<AttributionModel>("linear");
  const [lookbackDays, setLookbackDays] = useState(30);
  const [dateRange] = useState({ from: "", to: "" }); // Use default (last 30 days)

  const { data: attribution, isLoading, error } = useAttribution(
    dateRange.from || undefined,
    dateRange.to || undefined,
    model,
    lookbackDays,
  );

  const { data: paths, isLoading: pathsLoading } = useConversionPaths(
    dateRange.from || undefined,
    dateRange.to || undefined,
    15,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Touch Attribution</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analyze how different marketing channels contribute to conversions
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-1">
            Attribution Model
          </label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value as AttributionModel)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {ATTRIBUTION_MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {ATTRIBUTION_MODELS.find((m) => m.value === model)?.description}
          </p>
        </div>

        <div className="w-40">
          <label htmlFor="lookback-select" className="block text-sm font-medium text-gray-700 mb-1">
            Lookback Window
          </label>
          <select
            id="lookback-select"
            value={lookbackDays}
            onChange={(e) => setLookbackDays(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load attribution data
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        </div>
      ) : attribution ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(attribution.total_revenue)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-medium text-gray-500">Total Conversions</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatNumber(attribution.total_conversions)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-medium text-gray-500">Active Channels</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {attribution.channels.length}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(
                  attribution.total_conversions > 0
                    ? attribution.total_revenue / attribution.total_conversions
                    : 0
                )}
              </p>
            </div>
          </div>

          {/* Channel Attribution Table */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Channel Attribution</h2>
              <p className="text-sm text-gray-500">
                Revenue and conversions attributed to each channel using {model.replace("_", " ")} model
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Channel</th>
                    <th className="px-6 py-3 text-right">Attributed Revenue</th>
                    <th className="px-6 py-3 text-right">Conversions</th>
                    <th className="px-6 py-3 text-right">Spend</th>
                    <th className="px-6 py-3 text-right">ROAS</th>
                    <th className="px-6 py-3 text-right">CPA</th>
                    <th className="px-6 py-3 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attribution.channels.map((channel) => (
                    <tr key={channel.channel} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${getChannelColor(channel.channel)}`} />
                          <span className="font-medium text-gray-900 capitalize">
                            {channel.channel.replace("_", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(channel.attributed_revenue)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {channel.attributed_conversions.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {formatCurrency(channel.spend)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-medium ${channel.roas >= 1 ? "text-emerald-600" : "text-red-600"}`}>
                          {channel.roas.toFixed(2)}x
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {formatCurrency(channel.cpa)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-full ${getChannelColor(channel.channel)}`}
                              style={{ width: `${Math.min(channel.revenue_share, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{channel.revenue_share}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conversion Paths */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Top Conversion Paths</h2>
              <p className="text-sm text-gray-500">
                Most common sequences of touchpoints leading to conversions
              </p>
            </div>
            {pathsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
              </div>
            ) : paths && paths.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {paths.map((path, idx) => (
                  <div key={idx} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {path.path.split(" → ").map((step, stepIdx) => (
                          <span key={stepIdx} className="flex items-center gap-1">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getChannelColor(step).replace("bg-", "bg-opacity-20 text-").replace("-500", "-700")
                              } ${getChannelColor(step)}`}>
                              {step}
                            </span>
                            {stepIdx < path.path.split(" → ").length - 1 && (
                              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{path.conversions}</p>
                        <p className="text-xs text-gray-500">conversions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(path.revenue)}</p>
                        <p className="text-xs text-gray-500">revenue</p>
                      </div>
                      <div className="text-right w-16">
                        <p className="font-medium text-gray-900">{path.share}%</p>
                        <p className="text-xs text-gray-500">share</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  variant="default"
                  icon="branch"
                  title="No conversion paths found"
                  description="Conversion paths will appear here once you have data from multiple touchpoints leading to purchases."
                  actionLabel="Connect integrations"
                  actionHref="/integrations"
                  showDemoHint
                />
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
