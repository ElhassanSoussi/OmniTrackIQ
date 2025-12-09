import KPICard from "./kpi-card";

export type KPIItem = { label: string; value: string; subtext?: string; trend?: string; tone?: "positive" | "negative" | "neutral" };

const defaults: KPIItem[] = [
  { label: "Revenue", value: "$0", subtext: "Last 7 days", trend: "+0%", tone: "neutral" },
  { label: "Ad Spend", value: "$0", subtext: "Last 7 days", trend: "+0%", tone: "neutral" },
  { label: "ROAS", value: "0.0x", subtext: "Last 7 days", trend: "+0%", tone: "neutral" },
  { label: "Profit", value: "$0", subtext: "Last 7 days", trend: "+0%", tone: "neutral" },
];

export default function KPIGrid({ items = defaults }: { items?: KPIItem[] }) {
  // Determine grid columns based on number of items
  const gridCols = items.length <= 4 
    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4" 
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";

  return (
    <div className={`grid ${gridCols} gap-2 sm:gap-3 lg:gap-4`}>
      {items.map((item) => (
        <KPICard
          key={item.label}
          label={item.label}
          value={item.value}
          subtext={item.subtext}
          trend={item.trend}
          tone={item.tone}
        />
      ))}
    </div>
  );
}
