"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useRetentionPolicy,
  useCreateRetentionPolicy,
  useUpdateRetentionPolicy,
  formatRetentionPeriod,
} from "@/hooks/useEnterprise";
import {
  ArrowLeft,
  AlertTriangle,
  Info,
} from "lucide-react";

const RETENTION_PRESETS = [
  { label: "1 year", days: 365 },
  { label: "2 years", days: 730 },
  { label: "3 years", days: 1095 },
  { label: "5 years", days: 1825 },
  { label: "7 years", days: 2555 },
  { label: "10 years", days: 3650 },
];

export default function DataRetentionPage() {
  const { data: policy, isLoading } = useRetentionPolicy();
  const createPolicy = useCreateRetentionPolicy();
  const updatePolicy = useUpdateRetentionPolicy();

  const [metricsRetention, setMetricsRetention] = useState(730);
  const [ordersRetention, setOrdersRetention] = useState(1095);
  const [auditLogsRetention, setAuditLogsRetention] = useState(365);
  const [reportsRetention, setReportsRetention] = useState(365);
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [exportBeforeDelete, setExportBeforeDelete] = useState(true);
  const [exportDestination, setExportDestination] = useState("");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (policy) {
      setMetricsRetention(policy.metrics_retention_days);
      setOrdersRetention(policy.orders_retention_days);
      setAuditLogsRetention(policy.audit_logs_retention_days);
      setReportsRetention(policy.reports_retention_days);
      setAutoDeleteEnabled(policy.auto_delete_enabled);
      setExportBeforeDelete(policy.export_before_delete);
      setExportDestination(policy.export_destination || "");
    }
  }, [policy]);

  const handleSave = async () => {
    setMessage(null);
    const data = {
      metrics_retention_days: metricsRetention,
      orders_retention_days: ordersRetention,
      audit_logs_retention_days: auditLogsRetention,
      reports_retention_days: reportsRetention,
      auto_delete_enabled: autoDeleteEnabled,
      export_before_delete: exportBeforeDelete,
      export_destination: exportDestination || undefined,
    };

    try {
      if (policy) {
        await updatePolicy.mutateAsync(data);
      } else {
        await createPolicy.mutateAsync(data);
      }
      setMessage({ type: "success", text: "Data retention policy saved successfully" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save data retention policy" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings/enterprise"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Data Retention</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure how long different types of data are kept
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">About Data Retention</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Data retention policies help you comply with regulations like GDPR and CCPA by automatically managing how long data is stored. 
              Shorter retention periods reduce storage costs and privacy risks.
            </p>
          </div>
        </div>
      </div>

      {/* Retention Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Retention Periods</h2>
        </div>
        <div className="p-4 space-y-6">
          {/* Metrics Retention */}
          <RetentionField
            label="Metrics Data"
            description="Daily metrics, campaign performance, and analytics data"
            value={metricsRetention}
            onChange={setMetricsRetention}
            minDays={30}
          />

          {/* Orders Retention */}
          <RetentionField
            label="Order Data"
            description="Customer orders, transactions, and revenue data"
            value={ordersRetention}
            onChange={setOrdersRetention}
            minDays={30}
          />

          {/* Audit Logs Retention */}
          <RetentionField
            label="Audit Logs"
            description="Security events and user activity logs"
            value={auditLogsRetention}
            onChange={setAuditLogsRetention}
            minDays={30}
          />

          {/* Reports Retention */}
          <RetentionField
            label="Reports"
            description="Generated reports and scheduled report history"
            value={reportsRetention}
            onChange={setReportsRetention}
            minDays={30}
          />
        </div>
      </div>

      {/* Auto-deletion Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Auto-deletion</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Auto-deletion
              </p>
              <p className="text-xs text-gray-500">
                Automatically delete data older than the retention period
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoDeleteEnabled(!autoDeleteEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoDeleteEnabled ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoDeleteEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {autoDeleteEnabled && (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Auto-deletion permanently removes data. This action cannot be undone. 
                    We recommend enabling export before deletion.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Export Before Deletion
                  </p>
                  <p className="text-xs text-gray-500">
                    Create an export of data before it&apos;s deleted
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExportBeforeDelete(!exportBeforeDelete)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    exportBeforeDelete ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      exportBeforeDelete ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {exportBeforeDelete && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Export Destination (Optional)
                  </label>
                  <input
                    type="text"
                    value={exportDestination}
                    onChange={(e) => setExportDestination(e.target.value)}
                    placeholder="s3://bucket-name/path or gs://bucket-name/path"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to export to default location
                  </p>
                </div>
              )}
            </>
          )}

          {policy?.last_cleanup_at && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Last cleanup: {new Date(policy.last_cleanup_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={createPolicy.isPending || updatePolicy.isPending}
          className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
        >
          {createPolicy.isPending || updatePolicy.isPending ? "Saving..." : "Save Policy"}
        </button>
      </div>
    </div>
  );
}

function RetentionField({
  label,
  description,
  value,
  onChange,
  minDays,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (days: number) => void;
  minDays: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className="text-sm font-medium text-indigo-600">
          {formatRetentionPeriod(value)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={minDays}
          max={3650}
          step={30}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {RETENTION_PRESETS.map((preset) => (
          <button
            key={preset.days}
            type="button"
            onClick={() => onChange(preset.days)}
            className={`px-2 py-1 text-xs rounded ${
              value === preset.days
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
