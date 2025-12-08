"use client";

import { FunnelStage } from "@/hooks/useFunnel";
import { formatNumber, formatPercent } from "@/lib/format";

interface FunnelChartProps {
  stages: FunnelStage[];
  className?: string;
}

export function FunnelChart({ stages, className = "" }: FunnelChartProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No funnel data available
      </div>
    );
  }

  const maxValue = stages[0]?.value || 1;

  return (
    <div className={`space-y-4 ${className}`}>
      {stages.map((stage, index) => {
        const widthPercent = (stage.value / maxValue) * 100;
        const isFirst = index === 0;
        const isLast = index === stages.length - 1;

        return (
          <div key={stage.id} className="relative">
            {/* Stage Bar */}
            <div className="flex items-center gap-4">
              {/* Stage Name and Value */}
              <div className="w-32 shrink-0 text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {stage.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatNumber(stage.value)}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="relative flex-1">
                <div className="h-12 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${getFunnelColor(index, stages.length)}`}
                    style={{ width: `${Math.max(widthPercent, 1)}%` }}
                  />
                </div>

                {/* Percentage Badge */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <span className="rounded bg-white/90 px-2 py-0.5 text-sm font-semibold text-gray-900 shadow-sm dark:bg-gray-800/90 dark:text-white">
                    {formatPercent(stage.percentage / 100)}
                  </span>
                </div>
              </div>
            </div>

            {/* Drop-off Indicator */}
            {!isFirst && stage.drop_off > 0 && (
              <div className="ml-36 mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <svg
                  className="h-3 w-3 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                <span>
                  -{formatNumber(stage.drop_off)} ({stage.drop_off_rate.toFixed(1)}% drop-off)
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Color gradient for funnel stages
function getFunnelColor(index: number, total: number): string {
  const colors = [
    "bg-emerald-500",
    "bg-emerald-400",
    "bg-teal-400",
    "bg-cyan-400",
    "bg-sky-400",
    "bg-blue-400",
  ];
  return colors[Math.min(index, colors.length - 1)];
}

// Compact funnel for comparisons
interface CompactFunnelProps {
  stages: FunnelStage[];
  label: string;
  className?: string;
}

export function CompactFunnel({ stages, label, className = "" }: CompactFunnelProps) {
  if (!stages || stages.length === 0) return null;

  const maxValue = stages[0]?.value || 1;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <div className="space-y-1">
        {stages.map((stage, index) => {
          const widthPercent = (stage.value / maxValue) * 100;
          return (
            <div key={stage.id} className="flex items-center gap-2">
              <div className="w-20 truncate text-xs text-gray-500 dark:text-gray-400">
                {stage.name}
              </div>
              <div className="h-4 flex-1 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
                <div
                  className={`h-full ${getFunnelColor(index, stages.length)}`}
                  style={{ width: `${Math.max(widthPercent, 1)}%` }}
                />
              </div>
              <div className="w-12 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                {stage.percentage.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
