import { MetricTooltip } from "@/components/ui/metric-tooltip";

interface KPICardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: string;
  tone?: "positive" | "negative" | "neutral";
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

export default function KPICard({ label, value, subtext, trend, tone = "neutral" }: KPICardProps) {
  const toneClasses =
    tone === "positive" ? "text-emerald-600 dark:text-emerald-400" : tone === "negative" ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400";

  const metricKey = labelToMetric[label] || label.toLowerCase().replace(/\s+/g, "");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 lg:p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        <MetricTooltip metric={metricKey}>
          <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate">{label}</div>
        </MetricTooltip>
        {trend && <span className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap ${toneClasses}`}>{trend}</span>}
      </div>
      <div className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white truncate">{value}</div>
      {subtext && <div className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 truncate">{subtext}</div>}
    </div>
  );
}
