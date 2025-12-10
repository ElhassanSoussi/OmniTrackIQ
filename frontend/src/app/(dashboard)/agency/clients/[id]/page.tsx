"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useClientAccount,
  useUpdateClient,
  useClientBranding,
  useUpdateClientBranding,
  ClientStatus,
  ClientBranding,
} from "@/hooks/useAgency";
import { useClientContext } from "@/contexts/ClientContext";

const statusOptions: { value: ClientStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "pending_setup", label: "Pending Setup" },
  { value: "archived", label: "Archived" },
];

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-b-2 border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

function DetailsTab({
  client,
  onUpdate,
  isUpdating,
}: {
  client: NonNullable<ReturnType<typeof useClientAccount>["data"]>;
  onUpdate: (data: Record<string, unknown>) => void;
  isUpdating: boolean;
}) {
  const [formData, setFormData] = useState({
    name: client.name,
    industry: client.industry || "",
    website: client.website || "",
    primary_contact_name: client.primary_contact_name || "",
    primary_contact_email: client.primary_contact_email || "",
    internal_notes: client.internal_notes || "",
    status: client.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      name: formData.name,
      industry: formData.industry || null,
      website: formData.website || null,
      primary_contact_name: formData.primary_contact_name || null,
      primary_contact_email: formData.primary_contact_email || null,
      internal_notes: formData.internal_notes || null,
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Client Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select industry</option>
            <option value="e-commerce">E-commerce</option>
            <option value="saas">SaaS</option>
            <option value="retail">Retail</option>
            <option value="fashion">Fashion</option>
            <option value="electronics">Electronics</option>
            <option value="food-beverage">Food & Beverage</option>
            <option value="health-beauty">Health & Beauty</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact Name
          </label>
          <input
            type="text"
            value={formData.primary_contact_name}
            onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact Email
          </label>
          <input
            type="email"
            value={formData.primary_contact_email}
            onChange={(e) => setFormData({ ...formData, primary_contact_email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Internal Notes
        </label>
        <textarea
          value={formData.internal_notes}
          onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
          rows={4}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="Notes visible only to your agency team..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isUpdating}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function BrandingTab({
  clientId,
  branding,
  onUpdate,
  isUpdating,
}: {
  clientId: string;
  branding: ClientBranding | undefined;
  onUpdate: (data: Partial<ClientBranding>) => void;
  isUpdating: boolean;
}) {
  const [formData, setFormData] = useState<Partial<ClientBranding>>({
    primary_color: branding?.primary_color || "#10B981",
    logo_url: branding?.logo_url || "",
    company_name: branding?.company_name || "",
    report_footer: branding?.report_footer || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">White-label Branding</h4>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              Customize how reports and dashboards appear when viewed by this client. These settings apply to exported reports and client-facing views.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Company Name
          </label>
          <input
            type="text"
            value={formData.company_name || ""}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Client's company name for reports"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Primary Color
          </label>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="color"
              value={formData.primary_color || "#10B981"}
              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={formData.primary_color || "#10B981"}
              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="#10B981"
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Logo URL
          </label>
          <input
            type="url"
            value={formData.logo_url || ""}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="https://example.com/logo.png"
          />
          {formData.logo_url && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-gray-500">Preview:</span>
              <img
                src={formData.logo_url}
                alt="Logo preview"
                className="h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Report Footer
          </label>
          <textarea
            value={formData.report_footer || ""}
            onChange={(e) => setFormData({ ...formData, report_footer: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Custom footer text for exported reports..."
          />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Preview</h4>
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: `${formData.primary_color}15` }}
        >
          <div className="flex items-center gap-3">
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="Logo" className="h-8 object-contain" />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: formData.primary_color }}
              >
                {(formData.company_name || "C").charAt(0)}
              </div>
            )}
            <span className="font-semibold" style={{ color: formData.primary_color }}>
              {formData.company_name || "Client Company"}
            </span>
          </div>
          {formData.report_footer && (
            <p className="mt-3 border-t pt-3 text-xs text-gray-500" style={{ borderColor: `${formData.primary_color}30` }}>
              {formData.report_footer}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isUpdating}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isUpdating ? "Saving..." : "Save Branding"}
        </button>
      </div>
    </form>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<"details" | "branding">("details");
  
  const { data: client, isLoading, error } = useClientAccount(clientId);
  const { data: branding } = useClientBranding(clientId);
  const updateClient = useUpdateClient();
  const updateBranding = useUpdateClientBranding();
  const { switchClient, isSwitching } = useClientContext();

  const handleUpdateClient = async (data: Record<string, unknown>) => {
    try {
      await updateClient.mutateAsync({ clientId, data });
    } catch (error) {
      console.error("Failed to update client:", error);
    }
  };

  const handleUpdateBranding = async (data: Partial<ClientBranding>) => {
    try {
      await updateBranding.mutateAsync({ clientId, branding: data });
    } catch (error) {
      console.error("Failed to update branding:", error);
    }
  };

  const handleSwitchToClient = async () => {
    try {
      await switchClient(clientId);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to switch client:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Client not found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          The client you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Link
          href="/agency/clients"
          className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/agency/clients"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              {client.logo_url ? (
                <img src={client.logo_url} alt={client.name} className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                client.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{client.slug}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleSwitchToClient}
          disabled={isSwitching}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          {isSwitching ? "Switching..." : "Switch to Client"}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>
            Details
          </TabButton>
          <TabButton active={activeTab === "branding"} onClick={() => setActiveTab("branding")}>
            White-label Branding
          </TabButton>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        {activeTab === "details" ? (
          <DetailsTab
            client={client}
            onUpdate={handleUpdateClient}
            isUpdating={updateClient.isPending}
          />
        ) : (
          <BrandingTab
            clientId={clientId}
            branding={branding}
            onUpdate={handleUpdateBranding}
            isUpdating={updateBranding.isPending}
          />
        )}
      </div>
    </div>
  );
}
