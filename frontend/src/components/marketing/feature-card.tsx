interface FeatureCardProps {
  title: string;
  description: string;
  tag?: string;
  icon?: React.ReactNode;
}

export function FeatureCard({ title, description, tag, icon }: FeatureCardProps) {
  return (
    <div className="h-full rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-6 hover:border-[#0969da] dark:hover:border-[#58a6ff] transition-colors">
      {icon && (
        <div className="mb-3 text-[#0969da] dark:text-[#58a6ff]">
          {icon}
        </div>
      )}
      {tag && (
        <div className="mb-3 inline-flex rounded-full bg-[#ddf4ff] dark:bg-[#388bfd26] px-2.5 py-0.5 text-xs font-medium text-[#0969da] dark:text-[#58a6ff]">
          {tag}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#1f2328] dark:text-[#e6edf3]">{title}</h3>
      <p className="mt-2 text-sm text-[#57606a] dark:text-[#8b949e]">{description}</p>
    </div>
  );
}
