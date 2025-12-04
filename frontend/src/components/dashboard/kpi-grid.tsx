import KPICard from "./kpi-card";

export type KPIItem = { label: string; value: string; subtext?: string; trend?: string; tone?: "positive" | "negative" | "neutral" };

const defaults: KPIItem[] = [
  { label: "Revenue", value: "$0", subtext: "Last 7 days", trend: "+0%", tone: "neutral" },
  { label: "Ad Spend", value: "$0", subtext: "Last 7 days", trend: "+0%", tone: "neutral" },
  { label: "ROAS", value: "0.0x", subtext: "Last 7 days", trend: "+0%", tone: "neutral" },
  { label: "Profit", value: "$0", subtext: "Last 7 days", trend: "+0%", tone: "neutral" },
];

export default function KPIGrid({ items = defaults }: { items?: KPIItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
