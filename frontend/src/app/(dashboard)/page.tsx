"use client";

import KPIGrid from "@/components/dashboard/kpi-grid";
import SummaryChart from "@/components/dashboard/summary-chart";
import { useMetrics } from "@/hooks/useMetrics";
import { getDefaultDateRange } from "@/lib/date-range";
import { formatCurrency, formatNumber } from "@/lib/formatters";

const fallbackCards = [
  { label: "Revenue", value: "$0", subtext: "Orders: 0" },
  { label: "Ad Spend", value: "$0" },
  { label: "ROAS", value: "0.00x" },
  { label: "Profit", value: "$0" },
];

export default function DashboardPage() {
  const { from, to } = getDefaultDateRange();
  const { data, isLoading, isError, error } = useMetrics(from, to);

  const cards = data
    ? [
        { label: "Revenue", value: formatCurrency(data.revenue), subtext: `Orders: ${formatNumber(data.orders)}` },
        { label: "Ad Spend", value: formatCurrency(data.spend) },
        { label: "ROAS", value: `${(data.roas || 0).toFixed(2)}x` },
        { label: "Profit", value: formatCurrency(data.profit) },
      ]
    : fallbackCards;

  return (
    <div className="space-y-6">
      {isError && <div className="text-sm text-rose-400">{error instanceof Error ? error.message : "Failed to load metrics."}</div>}
      <KPIGrid items={cards} />
      <SummaryChart daily={data?.daily} isLoading={isLoading} isError={isError} errorMessage={error instanceof Error ? error.message : undefined} />
    </div>
  );
}
