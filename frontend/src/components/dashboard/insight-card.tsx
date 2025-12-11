interface InsightCardProps {
  title: string;
  description: string;
  badge?: string;
}

export function InsightCard({ title, description, badge }: InsightCardProps) {
  return (
    <div className="h-full rounded-md border border-gh-border bg-gh-canvas-default p-4 dark:border-gh-border-dark dark:bg-gh-canvas-dark transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">{title}</div>
        {badge && (
          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">{description}</p>
    </div>
  );
}
