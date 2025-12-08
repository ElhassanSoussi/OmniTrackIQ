"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCustomReport, useUpdateCustomReport } from "@/hooks/useCustomReports";
import { ReportBuilder } from "@/components/reports/report-builder";
import { formatErrorMessage } from "@/lib/format";

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const { data: report, isLoading, error } = useCustomReport(reportId);
  const updateReport = useUpdateCustomReport();

  const handleSave = async (data: Parameters<typeof updateReport.mutateAsync>[0]["data"]) => {
    await updateReport.mutateAsync({ id: reportId, data });
    router.push(`/analytics/reports/${reportId}`);
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
      <div className="flex items-center gap-4">
        <Link
          href={`/analytics/reports/${reportId}`}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Report</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Modify &quot;{report.name}&quot;
          </p>
        </div>
      </div>

      {/* Builder */}
      <ReportBuilder
        initialConfig={report.config}
        initialName={report.name}
        initialDescription={report.description || ""}
        initialVisualization={report.visualization_type}
        initialIsShared={report.is_shared}
        initialIsFavorite={report.is_favorite}
        onSave={handleSave}
        isSaving={updateReport.isPending}
        mode="edit"
      />
    </div>
  );
}
