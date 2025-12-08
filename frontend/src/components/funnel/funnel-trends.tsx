"use client";

import { FunnelTrendPoint } from "@/hooks/useFunnel";
import { formatCurrency, formatNumber } from "@/lib/format";

interface FunnelTrendsChartProps {
  trends: FunnelTrendPoint[];
  className?: string;
}

export function FunnelTrendsChart({ trends, className = "" }: FunnelTrendsChartProps) {
  if (!trends || trends.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No trend data available
      </div>
    );
  }

  // Find max values for scaling
  const maxImpressions = Math.max(...trends.map((t) => t.impressions));
  const maxRevenue = Math.max(...trends.map((t) => t.revenue));
  const maxConvRate = Math.max(...trends.map((t) => t.conversion_rate));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Impressions & Clicks Trend */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Impressions & Clicks
        </h4>
        <div className="h-48 overflow-x-auto">
          <div className="flex h-full items-end gap-1" style={{ minWidth: `${trends.length * 40}px` }}>
            {trends.map((point, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                {/* Bars */}
                <div className="relative flex h-36 w-full items-end justify-center gap-1">
                  {/* Impressions bar */}
                  <div
                    className="w-3 rounded-t bg-blue-400 transition-all"
                    style={{ height: `${(point.impressions / maxImpressions) * 100}%` }}
                    title={`Impressions: ${formatNumber(point.impressions)}`}
                  />
                  {/* Clicks bar */}
                  <div
                    className="w-3 rounded-t bg-emerald-400 transition-all"
                    style={{ height: `${(point.clicks / maxImpressions) * 100}%` }}
                    title={`Clicks: ${formatNumber(point.clicks)}`}
                  />
                </div>
                {/* Date label */}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateLabel(point.period)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-blue-400"></span>
            Impressions
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-emerald-400"></span>
            Clicks
          </span>
        </div>
      </div>

      {/* Revenue & Conversion Rate Trend */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
          Revenue & Conversion Rate
        </h4>
        <div className="h-48 overflow-x-auto">
          <div className="flex h-full items-end gap-1" style={{ minWidth: `${trends.length * 40}px` }}>
            {trends.map((point, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative flex h-36 w-full items-end justify-center gap-1">
                  {/* Revenue bar */}
                  <div
                    className="w-3 rounded-t bg-amber-400 transition-all"
                    style={{ height: `${maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0}%` }}
                    title={`Revenue: ${formatCurrency(point.revenue)}`}
                  />
                  {/* Conversion rate bar */}
                  <div
                    className="w-3 rounded-t bg-purple-400 transition-all"
                    style={{ height: `${maxConvRate > 0 ? (point.conversion_rate / maxConvRate) * 100 : 0}%` }}
                    title={`Conv Rate: ${point.conversion_rate.toFixed(4)}%`}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDateLabel(point.period)}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-amber-400"></span>
            Revenue
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-purple-400"></span>
            Conversion Rate
          </span>
        </div>
      </div>
    </div>
  );
}

// Data table for trends
interface FunnelTrendsTableProps {
  trends: FunnelTrendPoint[];
  className?: string;
}

export function FunnelTrendsTable({ trends, className = "" }: FunnelTrendsTableProps) {
  if (!trends || trends.length === 0) return null;

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Period
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Impressions
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Clicks
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              CTR
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Purchases
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Revenue
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Conv Rate
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {trends.map((point, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                {formatDateLabel(point.period, true)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                {formatNumber(point.impressions)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                {formatNumber(point.clicks)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                {point.ctr.toFixed(2)}%
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                {formatNumber(point.purchases)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-emerald-600 dark:text-emerald-400">
                {formatCurrency(point.revenue)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                {point.conversion_rate.toFixed(4)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper to format date labels
function formatDateLabel(dateStr: string, full = false): string {
  try {
    const date = new Date(dateStr);
    if (full) {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr.slice(5, 10); // fallback to MM-DD
  }
}
