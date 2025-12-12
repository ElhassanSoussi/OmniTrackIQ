import { MetricTooltip } from "@/components/ui/metric-tooltip";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: string;
  trendValue?: number; // Numeric trend for determining direction
  tone?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

// Map display labels to metric keys
const labelToMetric: Record<string, string> = {
  "Revenue": "revenue",
  "Ad Spend": "spend",
  "ROAS": "roas",
  "Profit": "profit",
  "Orders": "orders",
  "Clicks": "clicks",
  "Impressions": "impressions",
  "Conversions": "conversions",
  "CTR": "ctr",
  "CPC": "cpc",
  "CPA": "cpa",
  "AOV": "aov",
  "CVR": "cvr",
  "CAC": "cac",
  "LTV": "ltv",
};

function TrendIndicator({ trend, tone }: { trend: string; tone: "positive" | "negative" | "neutral" }) {
  const isPositive = tone === "positive";
  const isNegative = tone === "negative";

  const bgColor = isPositive
    ? "bg-success-50 dark:bg-success-900/20"
    : isNegative
      ? "bg-danger-50 dark:bg-danger-900/20"
      : "bg-slate-100 dark:bg-slate-700";

  const textColor = isPositive
    ? "text-success-600 dark:text-success-400"
    : isNegative
      ? "text-danger-600 dark:text-danger-400"
      : "text-slate-500 dark:text-slate-400";

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${bgColor}`}>
      <Icon className={`h-3 w-3 ${textColor}`} />
      <span className={`text-xs font-medium ${textColor}`}>{trend}</span>
    </div>
  );
}

export default function KPICard({
  label,
  value,
  subtext,
  trend,
  tone = "neutral",
  icon
}: KPICardProps) {
  const metricKey = labelToMetric[label] || label.toLowerCase().replace(/\s+/g, "");

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800 transition-all duration-200 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600">
      {/* Optional icon background decoration */}
      {icon && (
        <div className="absolute right-4 top-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className="text-primary-500">{icon}</div>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <MetricTooltip metric={metricKey}>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-help">
            {label}
          </div>
        </MetricTooltip>
        {trend && <TrendIndicator trend={trend} tone={tone} />}
      </div>

      <div className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
        {value}
      </div>

      {subtext && (
        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {subtext}
        </div>
      )}

      {/* Mini sparkline placeholder - visual enhancement */}
      <div className="mt-3 flex items-end gap-0.5 h-8">
        {[40, 55, 45, 65, 50, 70, 80, 75, 85, 90, 80, 95].map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-gradient-to-t from-primary-500/60 to-primary-400/40 dark:from-primary-600/60 dark:to-primary-500/40 transition-all group-hover:from-primary-500 group-hover:to-primary-400"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

