"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, AlertTriangle, TrendingDown, DollarSign, Calendar, Moon, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface NotificationPreferences {
  id: string;
  email_notifications_enabled: boolean;
  in_app_notifications_enabled: boolean;
  anomaly_alerts_enabled: boolean;
  anomaly_sensitivity: string;
  spend_alerts_enabled: boolean;
  daily_spend_threshold: number | null;
  roas_alerts_enabled: boolean;
  roas_threshold: number | null;
  budget_alerts_enabled: boolean;
  budget_alert_percentage: number;
  weekly_report_enabled: boolean;
  weekly_report_day: number;
  monthly_report_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: number;
  quiet_hours_end: number;
  timezone: string;
}

interface NotificationStatus {
  email_configured: boolean;
  channels_available: string[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const SENSITIVITY_OPTIONS = [
  { value: "low", label: "Low", description: "Only major anomalies" },
  { value: "medium", label: "Medium", description: "Balanced detection" },
  { value: "high", label: "High", description: "All anomalies" },
];

export default function NotificationsSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [status, setStatus] = useState<NotificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
    fetchStatus();
  }, []);

  const fetchPreferences = async () => {
    try {
      const data = await apiFetch<NotificationPreferences>("/notifications/preferences");
      if (data) {
        setPreferences(data);
      }
    } catch (err) {
      setError("Failed to load notification preferences");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const data = await apiFetch<NotificationStatus>("/notifications/status");
      if (data) {
        setStatus(data);
      }
    } catch (err) {
      // Non-critical, just log
      console.error("Failed to fetch notification status");
    }
  };

  const updatePreference = async (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const data = await apiFetch<NotificationPreferences>("/notifications/preferences", {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      if (data) {
        setPreferences(data);
      }
    } catch (err) {
      setError("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({ 
    enabled, 
    onChange,
    disabled = false 
  }: { 
    enabled: boolean; 
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
        enabled ? "bg-emerald-600" : "bg-zinc-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Notification Settings</h1>
        <p className="text-zinc-400">
          Manage how and when you receive alerts and reports.
        </p>
      </div>

      {/* Email Not Configured Warning */}
      {status && !status.email_configured && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-amber-200 font-medium">Email notifications not configured</p>
              <p className="text-amber-400/70 text-sm mt-1">
                Email sending is not configured for this instance. In-app notifications will still work.
              </p>
            </div>
          </div>
        </div>
      )}

      {saving && (
        <div className="fixed top-4 right-4 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 flex items-center gap-2 shadow-lg z-50">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          <span className="text-sm text-zinc-300">Saving...</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Global Notification Channels */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-500" />
            Notification Channels
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-zinc-400 text-sm">Receive alerts and reports via email</p>
              </div>
              <ToggleSwitch
                enabled={preferences.email_notifications_enabled}
                onChange={(value) => updatePreference({ email_notifications_enabled: value })}
                disabled={!status?.email_configured}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">In-App Notifications</p>
                <p className="text-zinc-400 text-sm">Show notifications in the dashboard</p>
              </div>
              <ToggleSwitch
                enabled={preferences.in_app_notifications_enabled}
                onChange={(value) => updatePreference({ in_app_notifications_enabled: value })}
              />
            </div>
          </div>
        </section>

        {/* Anomaly Alerts */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Anomaly Alerts
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Enable Anomaly Alerts</p>
                <p className="text-zinc-400 text-sm">Get notified when unusual metric changes are detected</p>
              </div>
              <ToggleSwitch
                enabled={preferences.anomaly_alerts_enabled}
                onChange={(value) => updatePreference({ anomaly_alerts_enabled: value })}
              />
            </div>
            
            {preferences.anomaly_alerts_enabled && (
              <div className="pt-2">
                <label className="block text-sm text-zinc-400 mb-2">Detection Sensitivity</label>
                <div className="grid grid-cols-3 gap-2">
                  {SENSITIVITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updatePreference({ anomaly_sensitivity: option.value })}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        preferences.anomaly_sensitivity === option.value
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      <p className="text-white font-medium text-sm">{option.label}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Spend & ROAS Alerts */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Spend & Performance Alerts
          </h2>
          
          <div className="space-y-6">
            {/* Spend Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-medium">Daily Spend Alert</p>
                  <p className="text-zinc-400 text-sm">Alert when daily spend exceeds threshold</p>
                </div>
                <ToggleSwitch
                  enabled={preferences.spend_alerts_enabled}
                  onChange={(value) => updatePreference({ spend_alerts_enabled: value })}
                />
              </div>
              {preferences.spend_alerts_enabled && (
                <div className="mt-3">
                  <label className="block text-sm text-zinc-400 mb-1">Threshold Amount ($)</label>
                  <input
                    type="number"
                    value={preferences.daily_spend_threshold || ""}
                    onChange={(e) => updatePreference({ daily_spend_threshold: parseInt(e.target.value) || null })}
                    placeholder="e.g. 1000"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* ROAS Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-medium">ROAS Alert</p>
                  <p className="text-zinc-400 text-sm">Alert when ROAS drops below threshold</p>
                </div>
                <ToggleSwitch
                  enabled={preferences.roas_alerts_enabled}
                  onChange={(value) => updatePreference({ roas_alerts_enabled: value })}
                />
              </div>
              {preferences.roas_alerts_enabled && (
                <div className="mt-3">
                  <label className="block text-sm text-zinc-400 mb-1">Minimum ROAS (e.g. 200 = 2.0x)</label>
                  <input
                    type="number"
                    value={preferences.roas_threshold || ""}
                    onChange={(e) => updatePreference({ roas_threshold: parseInt(e.target.value) || null })}
                    placeholder="e.g. 200"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Budget Alert */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-medium">Budget Alert</p>
                  <p className="text-zinc-400 text-sm">Alert when approaching budget limit</p>
                </div>
                <ToggleSwitch
                  enabled={preferences.budget_alerts_enabled}
                  onChange={(value) => updatePreference({ budget_alerts_enabled: value })}
                />
              </div>
              {preferences.budget_alerts_enabled && (
                <div className="mt-3">
                  <label className="block text-sm text-zinc-400 mb-1">Alert at % of budget</label>
                  <select
                    value={preferences.budget_alert_percentage}
                    onChange={(e) => updatePreference({ budget_alert_percentage: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={50}>50%</option>
                    <option value={70}>70%</option>
                    <option value={80}>80%</option>
                    <option value={90}>90%</option>
                    <option value={95}>95%</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Scheduled Reports */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Scheduled Reports
          </h2>
          
          <div className="space-y-6">
            {/* Weekly Report */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-medium">Weekly Performance Report</p>
                  <p className="text-zinc-400 text-sm">Receive a summary of your weekly metrics</p>
                </div>
                <ToggleSwitch
                  enabled={preferences.weekly_report_enabled}
                  onChange={(value) => updatePreference({ weekly_report_enabled: value })}
                />
              </div>
              {preferences.weekly_report_enabled && (
                <div className="mt-3">
                  <label className="block text-sm text-zinc-400 mb-1">Send on</label>
                  <select
                    value={preferences.weekly_report_day}
                    onChange={(e) => updatePreference({ weekly_report_day: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Monthly Report */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Monthly Performance Report</p>
                <p className="text-zinc-400 text-sm">Receive a comprehensive monthly summary</p>
              </div>
              <ToggleSwitch
                enabled={preferences.monthly_report_enabled}
                onChange={(value) => updatePreference({ monthly_report_enabled: value })}
              />
            </div>
          </div>
        </section>

        {/* Quiet Hours */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Moon className="h-5 w-5 text-purple-500" />
            Quiet Hours
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Enable Quiet Hours</p>
                <p className="text-zinc-400 text-sm">Don&apos;t send notifications during specified hours</p>
              </div>
              <ToggleSwitch
                enabled={preferences.quiet_hours_enabled}
                onChange={(value) => updatePreference({ quiet_hours_enabled: value })}
              />
            </div>
            
            {preferences.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Start Time</label>
                  <select
                    value={preferences.quiet_hours_start}
                    onChange={(e) => updatePreference({ quiet_hours_start: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">End Time</label>
                  <select
                    value={preferences.quiet_hours_end}
                    onChange={(e) => updatePreference({ quiet_hours_end: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
