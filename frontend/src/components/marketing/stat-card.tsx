interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-lg shadow-emerald-500/5">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white md:text-3xl">{value}</div>
      {detail && <div className="mt-1 text-xs text-slate-400">{detail}</div>}
    </div>
  );
}
