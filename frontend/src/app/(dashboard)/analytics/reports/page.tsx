"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useCustomReports,
  useDeleteCustomReport,
  useDuplicateCustomReport,
  CustomReport,
  getVisualizationLabel,
} from "@/hooks/useCustomReports";
import { formatErrorMessage } from "@/lib/format";

const VISUALIZATION_ICONS: Record<string, string> = {
  table: "📊",
  line_chart: "📈",
  bar_chart: "📊",
  pie_chart: "🥧",
  area_chart: "📉",
  metric_cards: "🔢",
};

export default function ReportsListPage() {
  const [showShared, setShowShared] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading, error } = useCustomReports(showShared, showFavoritesOnly);
  const deleteReport = useDeleteCustomReport();
  const duplicateReport = useDuplicateCustomReport();

  const handleDelete = async (id: string) => {
    try {
      await deleteReport.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  const handleDuplicate = async (report: CustomReport) => {
    try {
      await duplicateReport.mutateAsync({ id: report.id });
    } catch (err) {
      console.error("Failed to duplicate report:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Custom Reports</h1>
          <p className="mt-1 text-sm text-[#57606a] dark:text-[#8b949e]">
            Create and manage personalized analytics reports
          </p>
        </div>
        <Link
          href="/analytics/reports/new"
          className="inline-flex items-center gap-2 rounded-md bg-[#238636] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-[#238636] focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Report
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-md border border-[#d0d7de] bg-white p-4 dark:border-[#30363d] dark:bg-[#161b22]">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="show-shared"
            checked={showShared}
            onChange={(e) => setShowShared(e.target.checked)}
            className="h-4 w-4 rounded border-[#d0d7de] text-[#238636] focus:ring-[#238636] dark:border-[#30363d] dark:bg-[#0d1117]"
          />
          <label htmlFor="show-shared" className="text-sm text-[#1f2328] dark:text-[#e6edf3]">
            Include shared reports
          </label>
        </div>
        <div className="h-4 w-px bg-[#d0d7de] dark:bg-[#30363d]" />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="favorites-only"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            className="h-4 w-4 rounded border-[#d0d7de] text-[#238636] focus:ring-[#238636] dark:border-[#30363d] dark:bg-[#0d1117]"
          />
          <label htmlFor="favorites-only" className="text-sm text-[#1f2328] dark:text-[#e6edf3]">
            Favorites only
          </label>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-md border border-[#ffccd5] bg-[#ffebe9] px-4 py-3 text-sm text-[#cf222e] dark:border-[#f8514966] dark:bg-[#f8514915] dark:text-[#f85149]">
          {formatErrorMessage(error)}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-md border border-[#d0d7de] bg-[#f6f8fa] dark:border-[#30363d] dark:bg-[#21262d]"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && data?.items.length === 0 && (
        <div className="rounded-md border border-dashed border-[#d0d7de] bg-white p-12 text-center dark:border-[#30363d] dark:bg-[#161b22]">
          <div className="mx-auto h-12 w-12 text-4xl">📊</div>
          <h3 className="mt-4 text-lg font-medium text-[#1f2328] dark:text-[#e6edf3]">No reports yet</h3>
          <p className="mt-2 text-sm text-[#57606a] dark:text-[#8b949e]">
            Create your first custom report to analyze your marketing data
          </p>
          <Link
            href="/analytics/reports/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#238636] px-4 py-2 text-sm font-medium text-white hover:bg-[#2ea043]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Report
          </Link>
        </div>
      )}

      {/* Reports Grid */}
      {!isLoading && data && data.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((report) => (
            <div
              key={report.id}
              className="group relative rounded-md border border-[#d0d7de] bg-white p-5 transition hover:border-[#238636] hover:shadow-gh dark:border-[#30363d] dark:bg-[#161b22] dark:hover:border-[#238636]"
            >
              {/* Favorite indicator */}
              {report.is_favorite && (
                <span className="absolute right-3 top-3 text-[#d29922]" title="Favorite">
                  ⭐
                </span>
              )}

              {/* Icon and Type */}
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl">
                  {VISUALIZATION_ICONS[report.visualization_type] || "📊"}
                </span>
                <span className="rounded-full bg-[#f6f8fa] px-2.5 py-0.5 text-xs font-medium text-[#57606a] dark:bg-[#21262d] dark:text-[#8b949e]">
                  {getVisualizationLabel(report.visualization_type)}
                </span>
                {report.is_shared && (
                  <span className="rounded-full bg-[#ddf4ff] px-2.5 py-0.5 text-xs font-medium text-[#0969da] dark:bg-[#388bfd26] dark:text-[#58a6ff]">
                    Shared
                  </span>
                )}
              </div>

              {/* Title */}
              <Link href={`/analytics/reports/${report.id}`}>
                <h3 className="font-semibold text-[#1f2328] hover:text-[#0969da] dark:text-[#e6edf3] dark:hover:text-[#58a6ff]">
                  {report.name}
                </h3>
              </Link>

              {/* Description */}
              {report.description && (
                <p className="mt-1 line-clamp-2 text-sm text-[#57606a] dark:text-[#8b949e]">
                  {report.description}
                </p>
              )}

              {/* Meta */}
              <div className="mt-3 flex items-center gap-2 text-xs text-[#6e7781] dark:text-[#6e7681]">
                <span>
                  {report.config.metrics.length} metric{report.config.metrics.length !== 1 ? "s" : ""}
                </span>
                <span>•</span>
                <span>{report.config.date_range}</span>
                {report.last_run_at && (
                  <>
                    <span>•</span>
                    <span>Last run {new Date(report.last_run_at).toLocaleDateString()}</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 border-t border-[#d0d7de] pt-4 dark:border-[#30363d]">
                <Link
                  href={`/analytics/reports/${report.id}`}
                  className="flex-1 rounded-md bg-[#dafbe1] px-3 py-1.5 text-center text-sm font-medium text-[#1a7f37] transition hover:bg-[#aceebb] dark:bg-[#23863629] dark:text-[#3fb950] dark:hover:bg-[#23863640]"
                >
                  View
                </Link>
                <Link
                  href={`/analytics/reports/${report.id}/edit`}
                  className="rounded-md border border-[#d0d7de] px-3 py-1.5 text-sm text-[#57606a] transition hover:bg-[#f6f8fa] dark:border-[#30363d] dark:text-[#8b949e] dark:hover:bg-[#21262d]"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDuplicate(report)}
                  className="rounded-md border border-[#d0d7de] px-3 py-1.5 text-sm text-[#57606a] transition hover:bg-[#f6f8fa] dark:border-[#30363d] dark:text-[#8b949e] dark:hover:bg-[#21262d]"
                  title="Duplicate"
                >
                  📋
                </button>
                <button
                  onClick={() => setDeleteConfirm(report.id)}
                  className="rounded-md border border-[#ffccd5] px-3 py-1.5 text-sm text-[#cf222e] transition hover:bg-[#ffebe9] dark:border-[#f8514966] dark:text-[#f85149] dark:hover:bg-[#f8514915]"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === report.id && (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white/95 dark:bg-[#161b22]/95">
                  <div className="text-center">
                    <p className="text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]">Delete this report?</p>
                    <div className="mt-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleDelete(report.id)}
                        disabled={deleteReport.isPending}
                        className="rounded-md bg-[#da3633] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#b62324] disabled:opacity-50"
                      >
                        {deleteReport.isPending ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-md border border-[#d0d7de] px-3 py-1.5 text-sm text-[#57606a] hover:bg-[#f6f8fa] dark:border-[#30363d] dark:text-[#8b949e]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
