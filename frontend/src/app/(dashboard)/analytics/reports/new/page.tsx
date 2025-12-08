"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateCustomReport } from "@/hooks/useCustomReports";
import { ReportBuilder } from "@/components/reports/report-builder";

export default function NewReportPage() {
  const router = useRouter();
  const createReport = useCreateCustomReport();

  const handleSave = async (data: Parameters<typeof createReport.mutateAsync>[0]) => {
    const report = await createReport.mutateAsync(data);
    router.push(`/analytics/reports/${report.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/analytics/reports"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Custom Report</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Build a personalized report with your preferred metrics and visualizations
          </p>
        </div>
      </div>

      {/* Builder */}
      <ReportBuilder
        onSave={handleSave}
        isSaving={createReport.isPending}
        mode="create"
      />
    </div>
  );
}
