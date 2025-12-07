type DailyPoint = {
  date: string;
  spend: number;
  clicks: number;
  impressions: number;
};

export default function SummaryChart({ daily = [], loading }: { daily?: DailyPoint[]; loading?: boolean }) {
  const maxSpend = daily.length ? Math.max(...daily.map((d) => d.spend)) || 1 : 1;
  const maxClicks = daily.length ? Math.max(...daily.map((d) => d.clicks)) || 1 : 1;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
        <span>Daily performance</span>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Spend</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <span className="text-slate-400">Clicks</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-slate-500">Loading chart…</div>
      ) : daily.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-slate-500">No daily data for this range yet.</div>
      ) : (
        <div className="flex h-56 items-end gap-4 overflow-x-auto">
          {daily.map((point) => {
            const spendHeight = Math.max((point.spend / maxSpend) * 100, 6);
            const clicksHeight = Math.max((point.clicks / maxClicks) * 100, 6);
            const label = new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

            return (
              <div key={point.date} className="flex flex-col items-center gap-2 text-xs text-slate-400">
                <div className="flex items-end gap-1">
                  <div
                    className="w-8 rounded-t-md bg-emerald-500/80"
                    style={{ height: `${spendHeight}%` }}
                    aria-label={`Spend ${point.spend}`}
                  />
                  <div
                    className="w-3 rounded-t-md bg-sky-500/80"
                    style={{ height: `${clicksHeight}%` }}
                    aria-label={`Clicks ${point.clicks}`}
                  />
                </div>
                <div className="text-[11px] text-slate-500">{label}</div>
                <div className="text-[11px] text-slate-300">${point.spend.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500">{point.clicks.toLocaleString()} clicks</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
