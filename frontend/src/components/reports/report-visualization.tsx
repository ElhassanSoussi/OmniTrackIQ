"use client";

import {
  ReportConfig,
  VisualizationType,
  MetricType,
  getMetricLabel,
  getMetricFormat,
  getDimensionLabel,
} from "@/hooks/useCustomReports";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

interface ReportVisualizationProps {
  data: Record<string, unknown>[];
  summary: Record<string, number>;
  config: ReportConfig;
  visualization: VisualizationType;
  comparisonSummary?: Record<string, number> | null;
}

function formatMetricValue(metric: MetricType, value: unknown): string {
  const num = Number(value || 0);
  const format = getMetricFormat(metric);
  
  switch (format) {
    case "currency":
      return formatCurrency(num);
    case "percent":
      return formatPercent(num);
    case "decimal":
      return num.toFixed(2);
    default:
      return formatNumber(num);
  }
}

function getPercentChange(current: number, previous: number): { value: number; isPositive: boolean } {
  if (previous === 0) return { value: 0, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(change), isPositive: change >= 0 };
}

// Metric Cards Visualization
function MetricCardsView({ summary, config, comparisonSummary }: {
  summary: Record<string, number>;
  config: ReportConfig;
  comparisonSummary?: Record<string, number> | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {config.metrics.map((metric) => {
        const value = summary[metric] ?? 0;
        const prevValue = comparisonSummary?.[metric];
        const change = prevValue !== undefined ? getPercentChange(value, prevValue) : null;
        
        return (
          <div
            key={metric}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {getMetricLabel(metric)}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {formatMetricValue(metric, value)}
            </p>
            {change && (
              <p className={`mt-1 text-xs font-medium ${
                change.isPositive ? "text-emerald-600" : "text-red-600"
              }`}>
                {change.isPositive ? "↑" : "↓"} {change.value.toFixed(1)}% vs prev period
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Table Visualization
function TableView({ data, config }: {
  data: Record<string, unknown>[];
  config: ReportConfig;
}) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        No data available for the selected criteria
      </div>
    );
  }

  // Get all columns from first row
  const columns = Object.keys(data[0] || {});
  const dimensionCols = columns.filter((c) => 
    ["date", "platform", "campaign", "utm_source", "utm_campaign", "utm_medium"].includes(c)
  );
  const metricCols = columns.filter((c) => !dimensionCols.includes(c));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {dimensionCols.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400"
              >
                {getDimensionLabel(col as any)}
              </th>
            ))}
            {metricCols.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400"
              >
                {getMetricLabel(col as MetricType)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              {dimensionCols.map((col) => (
                <td key={col} className="px-3 py-2 text-gray-900 dark:text-white">
                  {String(row[col] || "-")}
                </td>
              ))}
              {metricCols.map((col) => (
                <td key={col} className="px-3 py-2 text-right text-gray-900 dark:text-white">
                  {formatMetricValue(col as MetricType, row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Simple Bar Chart (CSS-based)
function BarChartView({ data, config }: {
  data: Record<string, unknown>[];
  config: ReportConfig;
}) {
  if (data.length === 0) return null;

  // Use first metric for bar height
  const primaryMetric = config.metrics[0];
  const dimensionKey = config.dimensions[0] || "date";
  
  // Find max value for scaling
  const maxValue = Math.max(...data.map((d) => Number(d[primaryMetric] || 0)));

  return (
    <div className="space-y-4">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {getMetricLabel(primaryMetric)} by {getDimensionLabel(dimensionKey as any)}
      </div>
      <div className="flex h-48 items-end gap-1">
        {data.slice(0, 30).map((row, i) => {
          const value = Number(row[primaryMetric] || 0);
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div
              key={i}
              className="group relative flex-1"
            >
              <div
                className="w-full rounded-t bg-emerald-500 transition-all hover:bg-emerald-600"
                style={{ height: `${height}%` }}
              />
              <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block dark:bg-gray-700">
                <div className="font-medium">{String(row[dimensionKey])}</div>
                <div>{formatMetricValue(primaryMetric, value)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple Line Chart (CSS-based)
function LineChartView({ data, config }: {
  data: Record<string, unknown>[];
  config: ReportConfig;
}) {
  if (data.length === 0) return null;

  const primaryMetric = config.metrics[0];
  const dimensionKey = config.dimensions[0] || "date";
  const values = data.map((d) => Number(d[primaryMetric] || 0));
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  // Generate SVG path
  const width = 100;
  const height = 60;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - minValue) / range) * height;
    return `${x},${y}`;
  });

  return (
    <div className="space-y-4">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {getMetricLabel(primaryMetric)} over time
      </div>
      <div className="relative h-48">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={(y / 100) * height}
              x2={width}
              y2={(y / 100) * height}
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-gray-200 dark:text-gray-700"
            />
          ))}
          {/* Area fill */}
          <path
            d={`M0,${height} L${points.join(" L")} L${width},${height} Z`}
            fill="url(#gradient)"
            opacity="0.3"
          />
          {/* Line */}
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-xs text-gray-400">
          <span>{formatMetricValue(primaryMetric, maxValue)}</span>
          <span>{formatMetricValue(primaryMetric, minValue)}</span>
        </div>
      </div>
    </div>
  );
}

// Area Chart (similar to line but filled)
function AreaChartView({ data, config }: {
  data: Record<string, unknown>[];
  config: ReportConfig;
}) {
  // Reuse line chart with fill
  return <LineChartView data={data} config={config} />;
}

// Pie Chart (CSS-based)
function PieChartView({ data, config }: {
  data: Record<string, unknown>[];
  config: ReportConfig;
}) {
  if (data.length === 0) return null;

  const primaryMetric = config.metrics[0];
  const dimensionKey = config.dimensions[0] || "platform";
  
  const total = data.reduce((sum, d) => sum + Number(d[primaryMetric] || 0), 0);
  if (total === 0) return null;

  const COLORS = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-yellow-500",
    "bg-red-500",
  ];

  // Calculate percentages
  const slices = data.slice(0, 8).map((row, i) => ({
    label: String(row[dimensionKey]),
    value: Number(row[primaryMetric] || 0),
    percentage: (Number(row[primaryMetric] || 0) / total) * 100,
    color: COLORS[i % COLORS.length],
  }));

  // Build conic gradient
  let gradientStops = "";
  let currentAngle = 0;
  slices.forEach((slice, i) => {
    const startAngle = currentAngle;
    const endAngle = currentAngle + (slice.percentage * 3.6); // Convert % to degrees
    const colorHex = getColorHex(COLORS[i % COLORS.length]);
    gradientStops += `${colorHex} ${startAngle}deg ${endAngle}deg, `;
    currentAngle = endAngle;
  });
  gradientStops = gradientStops.slice(0, -2); // Remove trailing comma

  return (
    <div className="flex items-center gap-6">
      {/* Pie */}
      <div
        className="h-40 w-40 flex-shrink-0 rounded-full"
        style={{ background: `conic-gradient(${gradientStops})` }}
      />
      {/* Legend */}
      <div className="space-y-2">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className={`h-3 w-3 rounded-full ${slice.color}`} />
            <span className="text-gray-700 dark:text-gray-300">{slice.label}</span>
            <span className="text-gray-500 dark:text-gray-400">
              {slice.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getColorHex(bgClass: string): string {
  const colorMap: Record<string, string> = {
    "bg-emerald-500": "#10b981",
    "bg-blue-500": "#3b82f6",
    "bg-purple-500": "#8b5cf6",
    "bg-orange-500": "#f97316",
    "bg-pink-500": "#ec4899",
    "bg-cyan-500": "#06b6d4",
    "bg-yellow-500": "#eab308",
    "bg-red-500": "#ef4444",
  };
  return colorMap[bgClass] || "#6b7280";
}

export function ReportVisualization({
  data,
  summary,
  config,
  visualization,
  comparisonSummary,
}: ReportVisualizationProps) {
  switch (visualization) {
    case "metric_cards":
      return <MetricCardsView summary={summary} config={config} comparisonSummary={comparisonSummary} />;
    case "bar_chart":
      return <BarChartView data={data} config={config} />;
    case "line_chart":
      return <LineChartView data={data} config={config} />;
    case "area_chart":
      return <AreaChartView data={data} config={config} />;
    case "pie_chart":
      return <PieChartView data={data} config={config} />;
    case "table":
    default:
      return <TableView data={data} config={config} />;
  }
}
