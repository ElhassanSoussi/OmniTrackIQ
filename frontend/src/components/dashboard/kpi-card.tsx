interface KPICardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: string;
  tone?: "positive" | "negative" | "neutral";
}

export default function KPICard({ label, value, subtext, trend, tone = "neutral" }: KPICardProps) {
  const toneClasses =
    tone === "positive" ? "text-emerald-200" : tone === "negative" ? "text-rose-300" : "text-slate-400";

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-inner shadow-black/20">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
        {trend && <span className={`text-xs font-semibold ${toneClasses}`}>{trend}</span>}
      </div>
      <div className="mt-1 text-3xl font-semibold text-white">{value}</div>
      {subtext && <div className="mt-1 text-xs text-slate-400">{subtext}</div>}
    </div>
  );
}
