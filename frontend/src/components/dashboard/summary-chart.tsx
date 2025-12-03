import { formatCurrency } from "@/lib/formatters";

interface SummaryChartProps {
  daily?: { date: string; spend: number; revenue: number }[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export default function SummaryChart({ daily, isLoading, isError, errorMessage }: SummaryChartProps) {
  const maxValue = Math.max(
    ...(daily || []).map((d) => Math.max(d.spend || 0, d.revenue || 0)),
    1
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
      <div className="mb-2 text-sm text-slate-400">Revenue vs Spend</div>

      {isLoading && <div className="h-48 flex items-center justify-center text-slate-500">Loading daily metrics...</div>}
      {isError && <div className="h-48 flex items-center justify-center text-rose-400">{errorMessage || "Failed to load metrics."}</div>}
      {!isLoading && !isError && (!daily || daily.length === 0) && (
        <div className="h-48 flex items-center justify-center text-slate-500">No daily data available.</div>
      )}

      {!isLoading && !isError && daily && daily.length > 0 && (
        <div className="flex h-48 items-end gap-2 overflow-x-auto">
          {daily.map((day) => {
            const spendHeight = ((day.spend || 0) / maxValue) * 100;
            const revenueHeight = ((day.revenue || 0) / maxValue) * 100;
            return (
              <div key={day.date} className="flex min-w-[60px] flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-end gap-1">
                  <div
                    className="w-1/2 rounded bg-slate-600"
                    style={{ height: `${spendHeight}%` }}
                    title={`Spend: ${formatCurrency(day.spend || 0)}`}
                  />
                  <div
                    className="w-1/2 rounded bg-emerald-500"
                    style={{ height: `${revenueHeight}%` }}
                    title={`Revenue: ${formatCurrency(day.revenue || 0)}`}
                  />
                </div>
                <div className="text-[10px] uppercase text-slate-500">{day.date}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
