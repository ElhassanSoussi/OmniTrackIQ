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
    tone === "positive" ? "text-emerald-600" : tone === "negative" ? "text-red-600" : "text-gray-500";

  const metricKey = labelToMetric[label] || label.toLowerCase().replace(/\s+/g, "");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <MetricTooltip metric={metricKey}>
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
        </MetricTooltip>
        {trend && <span className={`text-xs font-semibold ${toneClasses}`}>{trend}</span>}
      </div>
      <div className="mt-2 text-3xl font-semibold text-gray-900">{value}</div>
      {subtext && <div className="mt-1 text-sm text-gray-500">{subtext}</div>}
    </div>
  );
}
