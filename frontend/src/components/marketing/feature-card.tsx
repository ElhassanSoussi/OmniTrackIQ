interface FeatureCardProps {
  title: string;
  description: string;
  tag?: string;
}

export function FeatureCard({ title, description, tag }: FeatureCardProps) {
  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      {tag && (
        <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {tag}
        </div>
      )}
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
