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
    tone === "positive" ? "text-brand-600 dark:text-brand-400" : tone === "negative" ? "text-gh-danger dark:text-gh-danger-dark" : "text-gh-text-tertiary dark:text-gh-text-tertiary-dark";

  const metricKey = labelToMetric[label] || label.toLowerCase().replace(/\s+/g, "");

  return (
    <div className="rounded-md border border-gh-border bg-gh-canvas-default p-3 sm:p-4 dark:border-gh-border-dark dark:bg-gh-canvas-dark transition-colors">
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        <MetricTooltip metric={metricKey}>
          <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-gh-text-tertiary dark:text-gh-text-tertiary-dark truncate">{label}</div>
        </MetricTooltip>
        {trend && <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${toneClasses}`}>{trend}</span>}
      </div>
      <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark truncate">{value}</div>
      {subtext && <div className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark truncate">{subtext}</div>}
    </div>
  );
}
