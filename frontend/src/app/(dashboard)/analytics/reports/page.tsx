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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and manage personalized analytics reports
          </p>
        </div>
        <Link
          href="/analytics/reports/new"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Report
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="show-shared"
            checked={showShared}
            onChange={(e) => setShowShared(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <label htmlFor="show-shared" className="text-sm text-gray-700 dark:text-gray-300">
            Include shared reports
          </label>
        </div>
        <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="favorites-only"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <label htmlFor="favorites-only" className="text-sm text-gray-700 dark:text-gray-300">
            Favorites only
          </label>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {formatErrorMessage(error)}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && data?.items.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <div className="mx-auto h-12 w-12 text-4xl">📊</div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No reports yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create your first custom report to analyze your marketing data
          </p>
          <Link
            href="/analytics/reports/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
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
              className="group relative rounded-xl border border-gray-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-700"
            >
              {/* Favorite indicator */}
              {report.is_favorite && (
                <span className="absolute right-3 top-3 text-yellow-500" title="Favorite">
                  ⭐
                </span>
              )}

              {/* Icon and Type */}
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl">
                  {VISUALIZATION_ICONS[report.visualization_type] || "📊"}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {getVisualizationLabel(report.visualization_type)}
                </span>
                {report.is_shared && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    Shared
                  </span>
                )}
              </div>

              {/* Title */}
              <Link href={`/analytics/reports/${report.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400">
                  {report.name}
                </h3>
              </Link>

              {/* Description */}
              {report.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                  {report.description}
                </p>
              )}

              {/* Meta */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
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
              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                <Link
                  href={`/analytics/reports/${report.id}`}
                  className="flex-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-center text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                >
                  View
                </Link>
                <Link
                  href={`/analytics/reports/${report.id}/edit`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDuplicate(report)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  title="Duplicate"
                >
                  📋
                </button>
                <button
                  onClick={() => setDeleteConfirm(report.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === report.id && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/95 dark:bg-gray-900/95">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Delete this report?</p>
                    <div className="mt-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleDelete(report.id)}
                        disabled={deleteReport.isPending}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleteReport.isPending ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
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
