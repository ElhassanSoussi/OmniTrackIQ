"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useCustomReport,
  useDeleteCustomReport,
  useDuplicateCustomReport,
  useUpdateCustomReport,
  getVisualizationLabel,
  getMetricLabel,
  type ReportResults,
} from "@/hooks/useCustomReports";
import { apiFetch } from "@/lib/api-client";
import { ReportVisualization } from "@/components/reports/report-visualization";
import { formatErrorMessage } from "@/lib/format";

// CSV Export helper
function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) => 
      headers.map((h) => {
        const value = row[h];
        // Escape values with commas or quotes
        const stringValue = String(value ?? "");
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(",")
    ),
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function ReportViewPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const { data: report, isLoading, error } = useCustomReport(reportId);
  const deleteReport = useDeleteCustomReport();
  const duplicateReport = useDuplicateCustomReport();
  const updateReport = useUpdateCustomReport();

  const [results, setResults] = useState<ReportResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Run report on load
  useEffect(() => {
    const runInitialReport = async () => {
      if (!reportId) return;
      setIsRunning(true);
      setRunError(null);
      try {
        const data = await apiFetch(`/custom-reports/${reportId}/run`, {
          method: "POST",
        });
        setResults(data as ReportResults);
      } catch (err) {
        setRunError(formatErrorMessage(err));
      } finally {
        setIsRunning(false);
      }
    };

    if (report && !results && !isRunning) {
      runInitialReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report, reportId]);

  const runReport = async () => {
    if (!reportId) return;
    setIsRunning(true);
    setRunError(null);
    try {
      const data = await apiFetch(`/custom-reports/${reportId}/run`, {
        method: "POST",
      });
      setResults(data as ReportResults);
    } catch (err) {
      setRunError(formatErrorMessage(err));
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportCSV = () => {
    if (!results || !report) return;
    const filename = `${report.name.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}`;
    exportToCSV(results.data, filename);
  };

  const handleDelete = async () => {
    try {
      await deleteReport.mutateAsync(reportId);
      router.push("/analytics/reports");
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newReport = await duplicateReport.mutateAsync({ id: reportId });
      router.push(`/analytics/reports/${newReport.id}/edit`);
    } catch (err) {
      console.error("Failed to duplicate:", err);
    }
  };

  const toggleFavorite = async () => {
    if (!report) return;
    try {
      await updateReport.mutateAsync({
        id: reportId,
        data: { is_favorite: !report.is_favorite },
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-700 dark:text-red-400">
          {error ? formatErrorMessage(error) : "Report not found"}
        </p>
        <Link
          href="/analytics/reports"
          className="mt-4 inline-block text-sm text-emerald-600 hover:underline dark:text-emerald-400"
        >
          ← Back to reports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/analytics/reports"
            className="mt-1 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{report.name}</h1>
              <button
                onClick={toggleFavorite}
                className={`text-xl transition ${report.is_favorite ? "text-yellow-500" : "text-gray-300 hover:text-yellow-500 dark:text-gray-600"}`}
                title={report.is_favorite ? "Remove from favorites" : "Add to favorites"}
              >
                {report.is_favorite ? "⭐" : "☆"}
              </button>
            </div>
            {report.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {getVisualizationLabel(report.visualization_type)}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400">
                {report.config.metrics.length} metrics
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400">
                {report.config.date_range}
              </span>
              {report.is_shared && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    Shared
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={runReport}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Running...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!results || results.data.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            title="Export to CSV"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <Link
            href={`/analytics/reports/${reportId}/edit`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Edit
          </Link>
          <button
            onClick={handleDuplicate}
            disabled={duplicateReport.isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Duplicate
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Report?</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone. The report &quot;{report.name}&quot; will be permanently deleted.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteReport.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteReport.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {runError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {runError}
        </div>
      )}

      {/* Results */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {isRunning && !results && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Running report...</p>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            {report.visualization_type !== "metric_cards" && Object.keys(results.summary).length > 0 && (
              <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-800">
                <h3 className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-400">Summary</h3>
                <ReportVisualization
                  data={[]}
                  summary={results.summary}
                  config={report.config}
                  visualization="metric_cards"
                  comparisonSummary={results.comparison_summary}
                />
              </div>
            )}

            {/* Main Visualization */}
            <ReportVisualization
              data={results.data}
              summary={results.summary}
              config={report.config}
              visualization={report.visualization_type}
              comparisonSummary={results.comparison_summary}
            />

            {/* Meta */}
            <div className="border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
              {results.total_rows} row{results.total_rows !== 1 ? "s" : ""} • 
              Last updated {new Date(results.executed_at).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
