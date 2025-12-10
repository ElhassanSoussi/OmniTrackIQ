"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useEnterpriseOverview,
  useSSOConfig,
  useRetentionPolicy,
  useAPIKeys,
  useAuditSummary,
  getSSOProviderLabel,
  getSSOStatusLabel,
  getSSOStatusColor,
  formatRetentionPeriod,
} from "@/hooks/useEnterprise";
import { 
  ShieldCheck, 
  Key, 
  Clock, 
  FileText,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function EnterpriseSettingsPage() {
  const { data: overview, isLoading: overviewLoading } = useEnterpriseOverview();
  const { data: ssoConfig } = useSSOConfig();
  const { data: retentionPolicy } = useRetentionPolicy();
  const { data: apiKeys } = useAPIKeys();
  const { data: auditSummary } = useAuditSummary(7);

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Enterprise Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure enterprise-grade security and compliance features
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Enterprise Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure enterprise-grade security and compliance features
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SSO Status Card */}
        <Link
          href="/settings/enterprise/sso"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="mt-3 font-medium text-gray-900 dark:text-white">Single Sign-On</h3>
          {overview?.sso.configured ? (
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getSSOStatusColor(overview.sso.status!)}`}>
                {getSSOStatusLabel(overview.sso.status!)}
              </span>
              <span className="text-xs text-gray-500">{getSSOProviderLabel(overview.sso.provider!)}</span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-500">Not configured</p>
          )}
        </Link>

        {/* API Keys Card */}
        <Link
          href="/settings/enterprise/api-keys"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="mt-3 font-medium text-gray-900 dark:text-white">API Keys</h3>
          <p className="mt-1 text-sm text-gray-500">
            {apiKeys?.length || 0} active keys
          </p>
        </Link>

        {/* Data Retention Card */}
        <Link
          href="/settings/enterprise/retention"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="mt-3 font-medium text-gray-900 dark:text-white">Data Retention</h3>
          {retentionPolicy ? (
            <p className="mt-1 text-sm text-gray-500">
              Metrics: {formatRetentionPeriod(retentionPolicy.metrics_retention_days)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">Using defaults</p>
          )}
        </Link>

        {/* Audit Logs Card */}
        <Link
          href="/settings/enterprise/audit-logs"
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="mt-3 font-medium text-gray-900 dark:text-white">Audit Logs</h3>
          <p className="mt-1 text-sm text-gray-500">
            {auditSummary?.total_events || 0} events (7 days)
          </p>
        </Link>
      </div>

      {/* Security Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Security Overview</h2>
        </div>
        <div className="p-4 space-y-4">
          {/* SSO Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {ssoConfig?.status === "active" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Single Sign-On</p>
                <p className="text-xs text-gray-500">
                  {ssoConfig?.status === "active" 
                    ? `Active with ${getSSOProviderLabel(ssoConfig.provider)}` 
                    : "SSO not active"}
                </p>
              </div>
            </div>
            <Link
              href="/settings/enterprise/sso"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Configure
            </Link>
          </div>

          {/* Enforce SSO */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {ssoConfig?.enforce_sso ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">SSO Enforcement</p>
                <p className="text-xs text-gray-500">
                  {ssoConfig?.enforce_sso 
                    ? "Password login disabled" 
                    : "Password login still allowed"}
                </p>
              </div>
            </div>
            {ssoConfig?.status === "active" && (
              <Link
                href="/settings/enterprise/sso"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {ssoConfig?.enforce_sso ? "Disable" : "Enable"}
              </Link>
            )}
          </div>

          {/* API Keys */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">API Key Management</p>
                <p className="text-xs text-gray-500">
                  {apiKeys?.length || 0} active API keys
                </p>
              </div>
            </div>
            <Link
              href="/settings/enterprise/api-keys"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Manage
            </Link>
          </div>

          {/* Data Retention */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {retentionPolicy?.auto_delete_enabled ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Data Retention Policy</p>
                <p className="text-xs text-gray-500">
                  {retentionPolicy?.auto_delete_enabled 
                    ? "Auto-deletion enabled" 
                    : "Auto-deletion disabled"}
                </p>
              </div>
            </div>
            <Link
              href="/settings/enterprise/retention"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Configure
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Audit Activity */}
      {auditSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-medium text-gray-900 dark:text-white">Recent Activity (7 days)</h2>
            <Link
              href="/settings/enterprise/audit-logs"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {auditSummary.total_events}
                </p>
                <p className="text-xs text-gray-500">Total Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {auditSummary.unique_users}
                </p>
                <p className="text-xs text-gray-500">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {auditSummary.failed_events}
                </p>
                <p className="text-xs text-gray-500">Failed Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {auditSummary.by_severity?.critical || 0}
                </p>
                <p className="text-xs text-gray-500">Critical Events</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Information */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-lg font-semibold">Compliance & Certifications</h2>
        <p className="mt-2 text-indigo-100 text-sm">
          OmniTrackIQ is designed with enterprise security in mind. We are actively working toward SOC 2 Type II certification.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm">
            GDPR Compliant
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm">
            CCPA Ready
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm">
            256-bit Encryption
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm">
            SOC 2 (In Progress)
          </span>
        </div>
      </div>
    </div>
  );
}
