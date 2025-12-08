"use client";

import { FunnelSummary } from "@/hooks/useFunnel";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

interface FunnelSummaryCardsProps {
  summary: FunnelSummary;
  className?: string;
}

export function FunnelSummaryCards({ summary, className = "" }: FunnelSummaryCardsProps) {
  const metrics = [
    {
      label: "Total Impressions",
      value: formatNumber(summary.total_impressions),
      icon: (
        <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      label: "Total Clicks",
      value: formatNumber(summary.total_clicks),
      icon: (
        <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
    },
    {
      label: "Click-Through Rate",
      value: `${summary.click_through_rate.toFixed(2)}%`,
      icon: (
        <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "Total Purchases",
      value: formatNumber(summary.total_purchases),
      icon: (
        <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: "Conversion Rate",
      value: `${summary.overall_conversion_rate.toFixed(4)}%`,
      highlight: true,
      icon: (
        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Total Revenue",
      value: formatCurrency(summary.total_revenue),
      highlight: true,
      icon: (
        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Average Order Value",
      value: formatCurrency(summary.average_order_value),
      icon: (
        <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 ${className}`}>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`rounded-xl border p-4 ${
            metric.highlight
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
              : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {metric.icon}
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {metric.label}
            </p>
          </div>
          <p
            className={`mt-2 text-xl font-bold ${
              metric.highlight
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// Comparison Summary with changes
interface ComparisonSummaryProps {
  current: FunnelSummary;
  previous: FunnelSummary;
  changes: Record<string, { change: number; change_percentage: number }>;
  className?: string;
}

export function ComparisonSummary({ current, previous, changes, className = "" }: ComparisonSummaryProps) {
  const metrics = [
    { key: "total_impressions", label: "Impressions", format: formatNumber },
    { key: "total_clicks", label: "Clicks", format: formatNumber },
    { key: "total_purchases", label: "Purchases", format: formatNumber },
    { key: "total_revenue", label: "Revenue", format: formatCurrency },
    { key: "overall_conversion_rate", label: "Conv. Rate", format: (v: number) => `${v.toFixed(4)}%` },
    { key: "click_through_rate", label: "CTR", format: (v: number) => `${v.toFixed(2)}%` },
  ];

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Metric
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Current
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Previous
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Change
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {metrics.map((metric) => {
            const currentValue = current[metric.key as keyof FunnelSummary] as number;
            const previousValue = previous[metric.key as keyof FunnelSummary] as number;
            const change = changes[metric.key];
            const isPositive = change?.change_percentage > 0;
            const isNegative = change?.change_percentage < 0;

            return (
              <tr key={metric.key}>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                  {metric.label}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                  {metric.format(currentValue)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                  {metric.format(previousValue)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium ${
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : isNegative
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-500"
                    }`}
                  >
                    {isPositive && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                    {isNegative && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    {change?.change_percentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
