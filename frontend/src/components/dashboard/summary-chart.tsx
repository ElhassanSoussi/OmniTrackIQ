type SummaryPoint = { label: string; revenue?: number; spend: number };

const sample: SummaryPoint[] = [
  { label: "Mon", revenue: 32000, spend: 12000 },
  { label: "Tue", revenue: 44000, spend: 18000 },
  { label: "Wed", revenue: 38000, spend: 15000 },
  { label: "Thu", revenue: 52000, spend: 21000 },
  { label: "Fri", revenue: 60000, spend: 24000 },
  { label: "Sat", revenue: 48000, spend: 20000 },
  { label: "Sun", revenue: 55000, spend: 22000 },
];

export default function SummaryChart({ data }: { data?: SummaryPoint[] }) {
  const dataset = data?.length ? data : sample;
  const maxValue =
    Math.max(
      ...dataset.flatMap((d) => {
        const values = [d.spend || 0];
        if (d.revenue !== undefined) values.push(d.revenue);
        return values;
      }),
    ) || 1;

  const showRevenue = dataset.some((d) => d.revenue !== undefined);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-gray-900">{showRevenue ? "Revenue vs Spend" : "Spend trend"}</div>
          <div className="text-xs text-gray-500">{data?.length ? "Live data" : "Sample data"}</div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {showRevenue && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
              Revenue
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-600">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden />
            Spend
          </div>
        </div>
      </div>

      <div className="flex h-56 items-end justify-between gap-3">
        {dataset.map((point) => {
          const revenueHeight = point.revenue ? (point.revenue / maxValue) * 100 : 0;
          const spendHeight = (point.spend / maxValue) * 100;
          return (
            <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-end justify-center gap-1.5">
                {showRevenue && (
                  <div
                    className="w-3 rounded-t-sm bg-emerald-500"
                    style={{ height: `${revenueHeight}%` }}
                  />
                )}
                <div
                  className="w-3 rounded-t-sm bg-blue-500"
                  style={{ height: `${spendHeight}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">{point.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
