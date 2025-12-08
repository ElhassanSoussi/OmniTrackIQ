"use client";

import { useState } from "react";
import {
  useScheduledReports,
  useCreateScheduledReport,
  useDeleteScheduledReport,
  useToggleScheduledReport,
  useReportOptions,
  ScheduledReport,
  CreateScheduledReportData,
  ReportFrequency,
  ReportType,
} from "@/hooks/useScheduledReports";

// Report creation/edit modal component
function ReportModal({
  isOpen,
  onClose,
  initialData,
  options,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ScheduledReport;
  options?: ReturnType<typeof useReportOptions>["data"];
}) {
  const createMutation = useCreateScheduledReport();
  const [formData, setFormData] = useState<CreateScheduledReportData>({
    name: initialData?.name || "",
    report_type: (initialData?.report_type as ReportType) || "overview",
    frequency: (initialData?.frequency as ReportFrequency) || "weekly",
    recipients: initialData?.recipients || [""],
    date_range_days: initialData?.date_range_days || "30",
    send_time: initialData?.send_time || "09:00",
    timezone: initialData?.timezone || "UTC",
    day_of_week: initialData?.day_of_week || "monday",
    day_of_month: initialData?.day_of_month || "1",
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Filter out empty recipients
    const cleanedData = {
      ...formData,
      recipients: formData.recipients.filter((r) => r.trim() !== ""),
    };

    if (cleanedData.recipients.length === 0) {
      setError("At least one recipient email is required");
      return;
    }

    try {
      await createMutation.mutateAsync(cleanedData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report");
    }
  };

  const addRecipient = () => {
    setFormData((prev) => ({
      ...prev,
      recipients: [...prev.recipients, ""],
    }));
  };

  const removeRecipient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => (i === index ? value : r)),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? "Edit Report" : "Create Scheduled Report"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Report Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Weekly Marketing Report"
              required
            />
          </div>

          {/* Report Type */}
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">Report Type</label>
            <select
              id="report-type"
              value={formData.report_type}
              onChange={(e) => setFormData((p) => ({ ...p, report_type: e.target.value as ReportType }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {options?.report_types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              )) || (
                <>
                  <option value="overview">Overview</option>
                  <option value="campaigns">Campaigns</option>
                  <option value="revenue">Revenue</option>
                  <option value="orders">Orders</option>
                </>
              )}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => setFormData((p) => ({ ...p, frequency: e.target.value as ReportFrequency }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Day of Week (for weekly) */}
          {formData.frequency === "weekly" && (
            <div>
              <label htmlFor="day-of-week" className="block text-sm font-medium text-gray-700">Day of Week</label>
              <select
                id="day-of-week"
                value={formData.day_of_week}
                onChange={(e) => setFormData((p) => ({ ...p, day_of_week: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Day of Month (for monthly) */}
          {formData.frequency === "monthly" && (
            <div>
              <label htmlFor="day-of-month" className="block text-sm font-medium text-gray-700">Day of Month</label>
              <select
                id="day-of-month"
                value={formData.day_of_month}
                onChange={(e) => setFormData((p) => ({ ...p, day_of_month: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d)}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Send Time & Timezone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="send-time" className="block text-sm font-medium text-gray-700">Send Time</label>
              <input
                id="send-time"
                type="time"
                value={formData.send_time}
                onChange={(e) => setFormData((p) => ({ ...p, send_time: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData((p) => ({ ...p, timezone: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {(options?.timezones || ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London"]).map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">Data Range</label>
            <select
              id="date-range"
              value={formData.date_range_days}
              onChange={(e) => setFormData((p) => ({ ...p, date_range_days: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Recipients</label>
            <div className="mt-1 space-y-2">
              {formData.recipients.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateRecipient(index, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="email@example.com"
                  />
                  {formData.recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRecipient(index)}
                      aria-label="Remove recipient"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRecipient}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                + Add another recipient
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Report card component
function ReportCard({
  report,
  onDelete,
  onToggle,
}: {
  report: ScheduledReport;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const formatNextSend = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getFrequencyLabel = (freq: string, dayOfWeek?: string, dayOfMonth?: string) => {
    switch (freq) {
      case "daily":
        return "Daily";
      case "weekly":
        return `Weekly on ${dayOfWeek?.charAt(0).toUpperCase()}${dayOfWeek?.slice(1) || "Monday"}`;
      case "monthly":
        return `Monthly on the ${dayOfMonth || "1"}${["st", "nd", "rd"][((parseInt(dayOfMonth || "1") + 90) % 100 - 10) % 10 - 1] || "th"}`;
      default:
        return freq;
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{report.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                report.is_active
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {report.is_active ? "Active" : "Paused"}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(report.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              report.is_active
                ? "text-amber-600 hover:bg-amber-50"
                : "text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {report.is_active ? "Pause" : "Resume"}
          </button>
          <button
            onClick={() => onDelete(report.id)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm">
        <div>
          <span className="text-gray-500">Frequency:</span>{" "}
          <span className="font-medium text-gray-700">
            {getFrequencyLabel(report.frequency, report.day_of_week, report.day_of_month)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Time:</span>{" "}
          <span className="font-medium text-gray-700">
            {report.send_time} ({report.timezone})
          </span>
        </div>
        <div>
          <span className="text-gray-500">Recipients:</span>{" "}
          <span className="font-medium text-gray-700">
            {report.recipients.length} email{report.recipients.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Data range:</span>{" "}
          <span className="font-medium text-gray-700">Last {report.date_range_days} days</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
        <span>
          Next send: <span className="font-medium">{formatNextSend(report.next_send_at)}</span>
        </span>
        <span>
          Sent {report.send_count} time{report.send_count !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data, isLoading, error } = useScheduledReports();
  const { data: options } = useReportOptions();
  const deleteMutation = useDeleteScheduledReport();
  const toggleMutation = useToggleScheduledReport();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this scheduled report?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggle = async (id: string) => {
    await toggleMutation.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900">Scheduled Reports</h1>
          <p className="text-sm text-gray-500">
            Automatically send analytics reports to your team via email.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Report
        </button>
      </div>

      {/* Settings Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <a
          href="/settings"
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Profile
        </a>
        <a
          href="/settings/team"
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Team
        </a>
        <a
          href="/settings/views"
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Saved Views
        </a>
        <a
          href="/settings/reports"
          className="border-b-2 border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600"
        >
          Reports
        </a>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load reports: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
          Loading reports...
        </div>
      ) : data?.items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No scheduled reports</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first automated email report.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Report
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.items.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      <ReportModal isOpen={showModal} onClose={() => setShowModal(false)} options={options} />
    </div>
  );
}
