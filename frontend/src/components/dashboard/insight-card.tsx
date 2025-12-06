interface InsightCardProps {
  title: string;
  description: string;
  badge?: string;
}

export function InsightCard({ title, description, badge }: InsightCardProps) {
  return (
    <div className="h-full rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg shadow-black/25">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-white">{title}</div>
        {badge && (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}
