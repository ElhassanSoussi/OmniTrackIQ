import KPICard from "./kpi-card";

const defaults = [
  { label: "Revenue", value: "$0" },
  { label: "Ad Spend", value: "$0" },
  { label: "ROAS", value: "0.0x" },
  { label: "Profit", value: "$0" },
];

export default function KPIGrid({ items = defaults }: { items?: { label: string; value: string; subtext?: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <KPICard key={item.label} label={item.label} value={item.value} subtext={item.subtext} />
      ))}
    </div>
  );
}
