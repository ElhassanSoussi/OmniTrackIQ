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
    <div className="rounded-md border border-gh-border bg-gh-canvas-default p-6 dark:border-gh-border-dark dark:bg-gh-canvas-dark transition-colors duration-200">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">{showRevenue ? "Revenue vs Spend" : "Spend trend"}</div>
          <div className="text-xs text-gh-text-secondary dark:text-gh-text-secondary-dark">{data?.length ? "Live data" : "Sample data"}</div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {showRevenue && (
            <div className="flex items-center gap-1.5 text-gh-text-secondary dark:text-gh-text-secondary-dark">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden />
              Revenue
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gh-text-secondary dark:text-gh-text-secondary-dark">
            <span className="h-2.5 w-2.5 rounded-full bg-gh-link" aria-hidden />
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
              <div className="flex w-full items-end justify-center gap-1.5 h-full">
                {showRevenue && (
                  <div
                    className={`w-3 rounded-t-sm bg-brand-500 transition-all duration-300`}
                    style={{ "--bar-height": `${revenueHeight}%`, height: "var(--bar-height)" } as React.CSSProperties}
                  />
                )}
                <div
                  className={`w-3 rounded-t-sm bg-gh-link transition-all duration-300`}
                  style={{ "--bar-height": `${spendHeight}%`, height: "var(--bar-height)" } as React.CSSProperties}
                />
              </div>
              <div className="text-xs text-gh-text-secondary dark:text-gh-text-secondary-dark">{point.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
