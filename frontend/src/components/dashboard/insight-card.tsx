interface InsightCardProps {
  title: string;
  description: string;
  badge?: string;
}

export function InsightCard({ title, description, badge }: InsightCardProps) {
  return (
    <div className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
        {badge && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
