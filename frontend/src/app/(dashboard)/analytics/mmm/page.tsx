"use client";

import { useState } from "react";
import {
  useChannelContribution,
  useBudgetOptimization,
  useDiminishingReturns,
  OptimizationGoal,
  ChannelContribution,
} from "@/hooks/useInsights";
import { getDateRange, DateRangeValue } from "@/lib/date-range";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

const CHANNEL_COLORS: Record<string, string> = {
  facebook: "bg-blue-500",
  google_ads: "bg-red-500",
  tiktok: "bg-pink-500",
  instagram: "bg-purple-500",
  email: "bg-yellow-500",
  direct: "bg-gray-500",
  organic: "bg-green-500",
};

const EFFICIENCY_COLORS: Record<string, string> = {
  excellent: "bg-emerald-100 text-emerald-800",
  good: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  break_even: "bg-orange-100 text-orange-800",
  poor: "bg-red-100 text-red-800",
};

function SaturationBar({ level }: { level: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Saturation</span>
        <span>{level}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            level > 70 ? "bg-red-500" : level > 50 ? "bg-yellow-500" : "bg-green-500"
          }`}
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}

function ChannelCard({ channel }: { channel: ChannelContribution }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${CHANNEL_COLORS[channel.channel] || "bg-slate-500"}`} />
          <h3 className="font-semibold text-gray-900 capitalize">{channel.channel.replace(/_/g, " ")}</h3>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${EFFICIENCY_COLORS[channel.efficiency_rating]}`}>
          {channel.efficiency_rating.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(channel.revenue)}</p>
          <p className="text-xs text-gray-400">{channel.revenue_share}% of total</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Spend</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(channel.spend)}</p>
          <p className="text-xs text-gray-400">{channel.spend_share}% of total</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ROAS</p>
          <p className="text-lg font-semibold text-gray-900">{channel.roas.toFixed(2)}x</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Marginal ROAS</p>
          <p className="text-lg font-semibold text-gray-900">{channel.marginal_roas.toFixed(2)}x</p>
        </div>
      </div>

      <SaturationBar level={channel.saturation_level} />

      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-gray-500">CTR</p>
          <p className="text-sm font-medium">{channel.ctr.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">CVR</p>
          <p className="text-sm font-medium">{channel.cvr.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">CPA</p>
          <p className="text-sm font-medium">{formatCurrency(channel.cpa)}</p>
        </div>
      </div>
    </div>
  );
}

export default function MMMPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const [optimizationGoal, setOptimizationGoal] = useState<OptimizationGoal>("balanced");
  const [customBudget, setCustomBudget] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"contribution" | "optimization" | "diminishing">("contribution");

  const { from, to } = getDateRange(range);

  const { data: contribution, isLoading: contributionLoading } = useChannelContribution(from, to);
  const { data: optimization, isLoading: optimizationLoading } = useBudgetOptimization(
    from,
    to,
    customBudget ? parseFloat(customBudget) : undefined,
    optimizationGoal
  );
  const { data: diminishing, isLoading: diminishingLoading } = useDiminishingReturns(from, to);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Mix Modeling</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analyze channel contribution and optimize budget allocation
          </p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as DateRangeValue)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="30d">Last 30 days</option>
          <option value="60d">Last 60 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: "contribution", label: "Channel Contribution" },
            { id: "optimization", label: "Budget Optimization" },
            { id: "diminishing", label: "Diminishing Returns" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Channel Contribution Tab */}
      {activeTab === "contribution" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {contribution && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(contribution.summary.total_revenue)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">Total Spend</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(contribution.summary.total_spend)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">Overall ROAS</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {contribution.summary.overall_roas.toFixed(2)}x
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-sm text-gray-500">Top Performer</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600 capitalize">
                  {contribution.summary.top_contributor?.replace(/_/g, " ") || "-"}
                </p>
              </div>
            </div>
          )}

          {/* Channel Cards */}
          {contributionLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
                  <div className="h-4 w-1/3 rounded bg-gray-200 mb-4" />
                  <div className="h-20 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : contribution?.channels.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">No channel data available for the selected period.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contribution?.channels.map((channel) => (
                <ChannelCard key={channel.channel} channel={channel} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Budget Optimization Tab */}
      {activeTab === "optimization" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Optimization Goal
              </label>
              <select
                value={optimizationGoal}
                onChange={(e) => setOptimizationGoal(e.target.value as OptimizationGoal)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="balanced">Balanced</option>
                <option value="maximize_revenue">Maximize Revenue</option>
                <option value="maximize_roas">Maximize ROAS</option>
                <option value="minimize_cpa">Minimize CPA</option>
              </select>
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Budget (optional)
              </label>
              <input
                type="number"
                placeholder="Use current spend"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Expected Impact */}
          {optimization && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="font-semibold text-emerald-900 mb-4">Expected Impact</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-emerald-700">Revenue Change</p>
                  <p className={`text-xl font-bold ${optimization.expected_impact.revenue_change >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {optimization.expected_impact.revenue_change >= 0 ? "+" : ""}
                    {formatCurrency(optimization.expected_impact.revenue_change)}
                  </p>
                  <p className="text-xs text-emerald-600">
                    ({optimization.expected_impact.revenue_change_percent >= 0 ? "+" : ""}
                    {optimization.expected_impact.revenue_change_percent.toFixed(1)}%)
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-700">Expected Revenue</p>
                  <p className="text-xl font-bold text-emerald-900">
                    {formatCurrency(optimization.expected_impact.expected_revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-700">ROAS Change</p>
                  <p className={`text-xl font-bold ${optimization.expected_impact.roas_change >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {optimization.expected_impact.roas_change >= 0 ? "+" : ""}
                    {optimization.expected_impact.roas_change.toFixed(2)}x
                  </p>
                </div>
                <div>
                  <p className="text-xs text-emerald-700">Confidence</p>
                  <p className="text-xl font-bold text-emerald-900 capitalize">
                    {optimization.expected_impact.confidence_level}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {optimizationLoading ? (
            <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
              <div className="h-40 rounded bg-gray-100" />
            </div>
          ) : optimization?.recommended_allocation.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">Not enough data to generate recommendations.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Budget Recommendations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Channel</th>
                      <th className="px-4 py-3 text-right">Current</th>
                      <th className="px-4 py-3 text-right">Recommended</th>
                      <th className="px-4 py-3 text-right">Change</th>
                      <th className="px-4 py-3 text-left">Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {optimization?.recommended_allocation.map((rec) => (
                      <tr key={rec.channel} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900 capitalize">
                          {rec.channel.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {formatCurrency(rec.current_spend)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatCurrency(rec.recommended_spend)}
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${rec.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {rec.change >= 0 ? "+" : ""}{formatCurrency(rec.change)}
                          <span className="text-xs ml-1">({rec.change_percent >= 0 ? "+" : ""}{rec.change_percent}%)</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                          {rec.rationale}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diminishing Returns Tab */}
      {activeTab === "diminishing" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Diminishing Returns Analysis</strong> shows how efficiency changes as you increase spend. 
              Channels showing strong diminishing returns may be approaching saturation.
            </p>
          </div>

          {diminishingLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
                  <div className="h-40 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : diminishing?.channels.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">Not enough data for diminishing returns analysis. Need at least 30 days of data.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {diminishing?.channels.map((channel) => (
                <div key={channel.channel} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {channel.channel.replace(/_/g, " ")}
                    </h3>
                    <div className="flex items-center gap-2">
                      {channel.shows_diminishing_returns ? (
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                          Shows Diminishing Returns
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Good Scalability
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {channel.quartile_analysis.map((q) => (
                      <div key={q.quartile} className="rounded-lg bg-gray-50 p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">{q.label}</p>
                        <p className="text-lg font-semibold text-gray-900">{q.roas.toFixed(2)}x</p>
                        <p className="text-xs text-gray-400">Avg: {formatCurrency(q.avg_daily_spend)}/day</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500">Efficiency Drop (Low → High Spend)</p>
                      <p className={`font-semibold ${channel.efficiency_drop_percent > 30 ? "text-red-600" : channel.efficiency_drop_percent > 15 ? "text-orange-600" : "text-green-600"}`}>
                        {channel.efficiency_drop_percent.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Optimal Daily Spend</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(channel.optimal_daily_spend_range.min)} - {formatCurrency(channel.optimal_daily_spend_range.max)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
                    💡 {channel.recommendation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
