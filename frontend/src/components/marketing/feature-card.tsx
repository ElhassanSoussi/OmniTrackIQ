interface FeatureCardProps {
  title: string;
  description: string;
  tag?: string;
}

export function FeatureCard({ title, description, tag }: FeatureCardProps) {
  return (
    <div className="h-full rounded-2xl border border-slate-800/70 bg-slate-900/70 p-6 shadow-xl shadow-black/30">
      {tag && (
        <div className="mb-3 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
          {tag}
        </div>
      )}
      <div className="text-lg font-semibold text-white">{title}</div>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}
