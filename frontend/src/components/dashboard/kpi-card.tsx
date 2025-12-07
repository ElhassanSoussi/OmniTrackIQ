interface KPICardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: string;
  tone?: "positive" | "negative" | "neutral";
}

export default function KPICard({ label, value, subtext, trend, tone = "neutral" }: KPICardProps) {
  const toneClasses =
    tone === "positive" ? "text-emerald-600" : tone === "negative" ? "text-red-600" : "text-gray-500";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
        {trend && <span className={`text-xs font-semibold ${toneClasses}`}>{trend}</span>}
      </div>
      <div className="mt-2 text-3xl font-semibold text-gray-900">{value}</div>
      {subtext && <div className="mt-1 text-sm text-gray-500">{subtext}</div>}
    </div>
  );
}
