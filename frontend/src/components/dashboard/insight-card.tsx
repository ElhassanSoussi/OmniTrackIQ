interface InsightCardProps {
  title: string;
  description: string;
  badge?: string;
}

export function InsightCard({ title, description, badge }: InsightCardProps) {
  return (
    <div className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        {badge && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
