interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ label, value, detail, trend }: StatCardProps) {
  const trendColors = {
    up: "text-[#1a7f37] dark:text-[#3fb950]",
    down: "text-[#cf222e] dark:text-[#f85149]",
    neutral: "text-[#57606a] dark:text-[#8b949e]",
  };

  return (
    <div className="rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-4">
      <div className="text-xs font-medium text-[#57606a] dark:text-[#8b949e]">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3] tabular-nums">{value}</div>
      {detail && (
        <div className={`mt-1 text-xs ${trend ? trendColors[trend] : "text-[#57606a] dark:text-[#8b949e]"}`}>
          {detail}
        </div>
      )}
    </div>
  );
}
