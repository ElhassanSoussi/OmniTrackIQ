"use client";

import { useState } from "react";
import { useInsights, usePredictiveAlerts, Insight, InsightPriority, InsightCategory } from "@/hooks/useInsights";
import { getDateRange, DateRangeValue } from "@/lib/date-range";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

const PRIORITY_COLORS: Record<InsightPriority, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const CATEGORY_ICONS: Record<InsightCategory, string> = {
  revenue: "💰",
  spend: "💸",
  efficiency: "⚡",
  growth: "📈",
  risk: "⚠️",
};

const CATEGORY_LABELS: Record<InsightCategory, string> = {
  revenue: "Revenue",
  spend: "Spend",
  efficiency: "Efficiency",
  growth: "Growth",
  risk: "Risk",
};

function PriorityBadge({ priority }: { priority: InsightPriority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${PRIORITY_COLORS[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{CATEGORY_ICONS[insight.category]}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{insight.title}</h3>
              <PriorityBadge priority={insight.priority} />
            </div>
            <p className="text-sm text-gray-600">{insight.description}</p>
            {insight.action && (
              <p className="mt-2 text-sm text-emerald-600 font-medium">
                💡 {insight.action}
              </p>
            )}
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
          {CATEGORY_LABELS[insight.category]}
        </span>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: { metric: string; severity: string; title: string; description: string; current_value: number; forecast_7d: number; forecast_change_percent: number; action: string; is_accelerating: boolean } }) {
  const severityColors: Record<string, string> = {
    critical: "border-red-500 bg-red-50",
    high: "border-orange-500 bg-orange-50",
    medium: "border-yellow-500 bg-yellow-50",
    low: "border-green-500 bg-green-50",
  };

  return (
    <div className={`rounded-xl border-l-4 ${severityColors[alert.severity] || severityColors.medium} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{alert.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
        </div>
        {alert.is_accelerating && (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
            Accelerating
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-gray-500">Current</p>
          <p className="text-lg font-semibold text-gray-900">
            {alert.metric === "spend" || alert.metric === "revenue"
              ? formatCurrency(alert.current_value)
              : formatNumber(alert.current_value)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">7-Day Forecast</p>
          <p className="text-lg font-semibold text-gray-900">
            {alert.metric === "spend" || alert.metric === "revenue"
              ? formatCurrency(alert.forecast_7d)
              : formatNumber(alert.forecast_7d)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Expected Change</p>
          <p className={`text-lg font-semibold ${alert.forecast_change_percent >= 0 ? "text-green-600" : "text-red-600"}`}>
            {alert.forecast_change_percent >= 0 ? "+" : ""}{formatPercent(alert.forecast_change_percent / 100)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-emerald-700 font-medium">
        → {alert.action}
      </p>
    </div>
  );
}

export default function InsightsPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const [categoryFilter, setCategoryFilter] = useState<InsightCategory | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<InsightPriority | "all">("all");
  
  const { from, to } = getDateRange(range);

  const { data: insights, isLoading, error } = useInsights(from, to);
  const { data: alerts, isLoading: alertsLoading } = usePredictiveAlerts(7);

  // Filter insights
  const filteredInsights = insights?.insights.filter((insight) => {
    if (categoryFilter !== "all" && insight.category !== categoryFilter) return false;
    if (priorityFilter !== "all" && insight.priority !== priorityFilter) return false;
    return true;
  }) || [];

  // Group insights by priority for summary
  const criticalCount = insights?.summary.by_priority.critical || 0;
  const highCount = insights?.summary.by_priority.high || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="mt-1 text-sm text-gray-500">
            AI-powered analysis and recommendations for your marketing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as DateRangeValue)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="14d">Last 14 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {insights && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Total Insights</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {insights.summary.total_insights}
            </p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">Critical & High Priority</p>
            <p className="mt-1 text-2xl font-bold text-red-700">
              {criticalCount + highCount}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Categories Analyzed</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {Object.keys(insights.summary.by_category).length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-500">Predictive Alerts</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {alerts?.length || 0}
            </p>
          </div>
        </div>
      )}

      {/* Predictive Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>🔮</span> Predictive Alerts
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {alerts.map((alert, index) => (
              <AlertCard key={index} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as InsightCategory | "all")}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="revenue">Revenue</option>
            <option value="spend">Spend</option>
            <option value="efficiency">Efficiency</option>
            <option value="growth">Growth</option>
            <option value="risk">Risk</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as InsightPriority | "all")}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Insights List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
              <div className="h-4 w-1/3 rounded bg-gray-200 mb-2" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load insights
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">
            {insights?.summary.total_insights === 0
              ? "No insights available. Generate more data to see AI-powered insights."
              : "No insights match your filters. Try adjusting the filters above."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Insights ({filteredInsights.length})
          </h2>
          {filteredInsights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      )}

      {/* How It Works */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-white p-6">
        <h3 className="font-semibold text-gray-900 mb-3">How AI Insights Work</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">1</span>
            <div>
              <p className="font-medium text-gray-900">Data Analysis</p>
              <p className="text-sm text-gray-500">We analyze your metrics daily</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">2</span>
            <div>
              <p className="font-medium text-gray-900">Pattern Detection</p>
              <p className="text-sm text-gray-500">AI identifies trends & anomalies</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">3</span>
            <div>
              <p className="font-medium text-gray-900">Forecasting</p>
              <p className="text-sm text-gray-500">Predict future performance</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">4</span>
            <div>
              <p className="font-medium text-gray-900">Recommendations</p>
              <p className="text-sm text-gray-500">Get actionable advice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
