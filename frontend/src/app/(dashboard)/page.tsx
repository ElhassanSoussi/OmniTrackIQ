import KPIGrid from "@/components/dashboard/kpi-grid";
import SummaryChart from "@/components/dashboard/summary-chart";

export default function DashboardPage() {
  const cards = [
    { label: "Revenue", value: "$22,340" },
    { label: "Ad Spend", value: "$6,200" },
    { label: "ROAS", value: "3.6x" },
    { label: "Profit", value: "$12,980" },
  ];

  return (
    <div className="space-y-6">
      <KPIGrid items={cards} />
      <SummaryChart />
    </div>
  );
}
