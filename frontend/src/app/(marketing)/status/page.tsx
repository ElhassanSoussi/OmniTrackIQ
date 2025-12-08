"use client";

import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  version: string;
  uptime_seconds: number;
  database: {
    status: string;
    message: string;
  };
  integrations: {
    shopify: boolean;
    facebook: boolean;
    google: boolean;
    tiktok: boolean;
    stripe: boolean;
  };
  timestamp: string;
}

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "unknown";
  latency?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function StatusPage() {
  const [apiStatus, setApiStatus] = useState<HealthStatus | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_URL}/health/status`, {
        cache: "no-store",
      });
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        const data: HealthStatus = await response.json();
        setApiStatus(data);
        
        // Build service status from response
        const serviceList: ServiceStatus[] = [
          {
            name: "API Server",
            status: data.status === "healthy" ? "operational" : "degraded",
            latency,
          },
          {
            name: "Database",
            status: data.database.status === "connected" ? "operational" : "outage",
          },
          {
            name: "Shopify Integration",
            status: data.integrations.shopify ? "operational" : "degraded",
          },
          {
            name: "Facebook Ads",
            status: data.integrations.facebook ? "operational" : "degraded",
          },
          {
            name: "Google Ads",
            status: data.integrations.google ? "operational" : "degraded",
          },
          {
            name: "TikTok Ads",
            status: data.integrations.tiktok ? "operational" : "degraded",
          },
          {
            name: "Stripe Billing",
            status: data.integrations.stripe ? "operational" : "degraded",
          },
        ];
        setServices(serviceList);
      } else {
        setApiStatus(null);
        setServices([
          { name: "API Server", status: "outage" },
          { name: "Database", status: "unknown" },
          { name: "Shopify Integration", status: "unknown" },
          { name: "Facebook Ads", status: "unknown" },
          { name: "Google Ads", status: "unknown" },
          { name: "TikTok Ads", status: "unknown" },
          { name: "Stripe Billing", status: "unknown" },
        ]);
      }
    } catch {
      setApiStatus(null);
      setServices([
        { name: "API Server", status: "outage" },
        { name: "Database", status: "unknown" },
        { name: "Shopify Integration", status: "unknown" },
        { name: "Facebook Ads", status: "unknown" },
        { name: "Google Ads", status: "unknown" },
        { name: "TikTok Ads", status: "unknown" },
        { name: "Stripe Billing", status: "unknown" },
      ]);
    }
    
    setLastChecked(new Date());
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
    // Refresh every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = () => {
    if (services.length === 0) return "unknown";
    const hasOutage = services.some((s) => s.status === "outage");
    const hasDegraded = services.some((s) => s.status === "degraded");
    if (hasOutage) return "outage";
    if (hasDegraded) return "degraded";
    return "operational";
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const statusConfig = {
    operational: {
      bg: "bg-emerald-500",
      text: "text-emerald-700",
      bgLight: "bg-emerald-50",
      label: "Operational",
    },
    degraded: {
      bg: "bg-yellow-500",
      text: "text-yellow-700",
      bgLight: "bg-yellow-50",
      label: "Degraded",
    },
    outage: {
      bg: "bg-red-500",
      text: "text-red-700",
      bgLight: "bg-red-50",
      label: "Outage",
    },
    unknown: {
      bg: "bg-gray-400",
      text: "text-gray-600",
      bgLight: "bg-gray-50",
      label: "Unknown",
    },
  };

  const overallStatus = getOverallStatus();
  const overall = statusConfig[overallStatus];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">System Status</h1>
          <p className="mt-2 text-gray-600">
            Current operational status of OmniTrackIQ services
          </p>
        </div>

        {/* Overall Status Card */}
        <div className={`mt-10 rounded-2xl ${overall.bgLight} p-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-4 w-4 rounded-full ${overall.bg}`} />
              <div>
                <h2 className={`text-2xl font-semibold ${overall.text}`}>
                  {loading ? "Checking..." : overall.label}
                </h2>
                <p className="text-gray-600">
                  {overallStatus === "operational"
                    ? "All systems are operating normally"
                    : overallStatus === "degraded"
                    ? "Some services may be experiencing issues"
                    : overallStatus === "outage"
                    ? "We are experiencing service disruptions"
                    : "Unable to determine status"}
                </p>
              </div>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Refresh"}
            </button>
          </div>
          {apiStatus && (
            <div className="mt-6 flex gap-8 border-t border-gray-200 pt-6 text-sm">
              <div>
                <span className="text-gray-500">Version:</span>{" "}
                <span className="font-medium text-gray-900">{apiStatus.version}</span>
              </div>
              <div>
                <span className="text-gray-500">Uptime:</span>{" "}
                <span className="font-medium text-gray-900">
                  {formatUptime(apiStatus.uptime_seconds)}
                </span>
              </div>
              {lastChecked && (
                <div>
                  <span className="text-gray-500">Last checked:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {lastChecked.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Service Status */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-900">Services</h3>
          <div className="mt-4 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {services.map((service) => {
              const config = statusConfig[service.status];
              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${config.bg}`} />
                    <span className="font-medium text-gray-900">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {service.latency && (
                      <span className="text-sm text-gray-500">
                        {service.latency}ms
                      </span>
                    )}
                    <span className={`text-sm font-medium ${config.text}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident History (placeholder) */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-center py-8 text-gray-500">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2 font-medium">No recent incidents</p>
                <p className="text-sm">All systems have been running smoothly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribe to Updates */}
        <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Stay Updated</h3>
          <p className="mt-2 text-gray-600">
            Get notified about scheduled maintenance and service incidents.
          </p>
          <form className="mt-4 flex gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-sm text-gray-500">
          <p>
            Having issues?{" "}
            <a
              href="/contact"
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
