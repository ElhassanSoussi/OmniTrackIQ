"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { SettingsNav } from "@/components/dashboard/settings-nav";

export default function OrganizationSettingsPage() {
    const { account, loading, error, saving, message, updateOrganization } = useSettings();

    const [name, setName] = useState("");
    const [industry, setIndustry] = useState("");
    const [currency, setCurrency] = useState("");
    const [timezone, setTimezone] = useState("");

    const [localMessage, setLocalMessage] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (account) {
            setName(account.account_name || "");
            setIndustry(account.industry || "");
            setCurrency(account.currency || "USD");
            // Use account timezone if specifically set, or fallback to default
            setTimezone(account.timezone || "UTC");
        }
    }, [account]);

    useEffect(() => {
        if (message) {
            setLocalMessage(message);
            const timeout = setTimeout(() => setLocalMessage(null), 3000);
            return () => clearTimeout(timeout);
        }
    }, [message]);

    useEffect(() => {
        if (error) {
            setLocalError(error);
        }
    }, [error]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setLocalError(null);
        setLocalMessage(null);
        try {
            await updateOrganization(name, industry, currency, timezone);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to update organization";
            setLocalError(msg);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Organization Settings</h1>
                <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Manage your workspace details and defaults.</p>
            </div>

            <SettingsNav />

            {/* Toast messages */}
            {localMessage && (
                <div className="rounded-md border border-gh-success-emphasis bg-gh-success-subtle px-4 py-3 text-sm text-gh-success-fg dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
                    ✓ {localMessage}
                </div>
            )}
            {localError && (
                <div className="rounded-md border border-gh-danger-emphasis bg-gh-danger-subtle px-4 py-3 text-sm text-gh-danger-fg dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                    {localError}
                </div>
            )}

            {loading ? (
                <div className="flex items-center gap-2 text-gh-text-secondary dark:text-gh-text-secondary-dark">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                    Loading details...
                </div>
            ) : (
                <div className="grid gap-6">
                    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-gh-border bg-gh-canvas-default p-6 dark:border-gh-border-dark dark:bg-gh-canvas-dark max-w-2xl">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Workspace Details</h2>
                            <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">These settings apply to all members of the organization.</p>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="name" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Workspace Name</label>
                            <input
                                id="name"
                                className="w-full rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2.5 text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="My Company"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label htmlFor="industry" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Industry</label>
                                <select
                                    id="industry"
                                    className="w-full rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2.5 text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                >
                                    <option value="">Select industry</option>
                                    <option value="ecommerce">E-commerce</option>
                                    <option value="saas">SaaS</option>
                                    <option value="agency">Agency</option>
                                    <option value="retail">Retail</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="currency" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Default Currency</label>
                                <select
                                    id="currency"
                                    className="w-full rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2.5 text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CAD">CAD ($)</option>
                                    <option value="AUD">AUD ($)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="timezone" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Default Timezone</label>
                            <select
                                id="timezone"
                                className="w-full rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2.5 text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time (US & Canada)</option>
                                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                <option value="Europe/London">London</option>
                                <option value="Europe/Paris">Paris</option>
                                <option value="Asia/Tokyo">Tokyo</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={saving === "organization"}
                            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving === "organization" ? "Save changes" : "Save changes"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
