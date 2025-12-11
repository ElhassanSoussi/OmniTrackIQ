interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark ${className || ""}`}
      style={style}
    />
  );
}

export function KPIGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-md border border-gh-border bg-gh-canvas-default p-4 dark:border-gh-border-dark dark:bg-gh-canvas-dark"
        >
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-7 w-24 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-md border border-gh-border bg-gh-canvas-default p-6 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex h-56 items-end justify-between gap-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-end justify-center gap-1.5 h-full">
              <Skeleton className="w-3" style={{ height: `${30 + Math.random() * 50}%` }} />
              <Skeleton className="w-3" style={{ height: `${20 + Math.random() * 40}%` }} />
            </div>
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-md border border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark">
      <div className="flex items-center justify-between border-b border-gh-border px-5 py-4 dark:border-gh-border-dark">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="p-5 space-y-3">
        {[...Array(rows)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
