"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { SettingsNav } from "@/components/dashboard/settings-nav";

export default function ProfileSettingsPage() {
    const { account, loading, error, saving, message, updateProfile, updateEmail, updatePassword } = useSettings();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [timezone, setTimezone] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [localMessage, setLocalMessage] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (account) {
            setName(account.name || "");
            setEmail(account.email || "");
            setAvatarUrl(account.avatar_url || "");
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

    async function handleProfileSubmit(e: FormEvent) {
        e.preventDefault();
        setLocalError(null);
        setLocalMessage(null);
        try {
            await updateProfile(name, avatarUrl, timezone);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to update profile";
            setLocalError(msg);
        }
    }

    async function handleEmailSubmit(e: FormEvent) {
        e.preventDefault();
        setLocalError(null);
        setLocalMessage(null);
        try {
            await updateEmail(email);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to update email";
            setLocalError(msg);
        }
    }

    async function handlePasswordSubmit(e: FormEvent) {
        e.preventDefault();
        setLocalError(null);
        setLocalMessage(null);
        try {
            await updatePassword(currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Unable to update password";
            setLocalError(msg);
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Profile Settings</h1>
                <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Manage your personal profile and login details.</p>
            </div>

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
                    Loading settings...
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Personal Profile Form */}
                    <form onSubmit={handleProfileSubmit} className="space-y-4 rounded-md border border-gh-border bg-gh-canvas-default p-6 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Personal Details</h2>
                            <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">How you appear to others.</p>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="displayName" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Display name</label>
                            <input
                                id="displayName"
                                className="w-full rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2.5 text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="avatarUrl" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Avatar URL</label>
                            <input
                                id="avatarUrl"
                                className="w-full rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2.5 text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="timezone" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Timezone</label>
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
                            disabled={saving === "profile"}
                            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving === "profile" ? "Saving..." : "Save changes"}
                        </button>
                    </form>

                    {/* Settings Navigation */}
                    <SettingsNav />
                    {/* Email Update Form */}
                    <form onSubmit={handleEmailSubmit} className="space-y-4 rounded-md border border-gh-border bg-gh-canvas-default p-6 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Login email</h2>
                            <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Change the email you use to sign in.</p>
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="email" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Email</label>
                            <input
                                id="email"
                                className="w-full rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2.5 text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving === "email"}
                            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving === "email" ? "Updating..." : "Update email"}
                        </button>
                    </form>

                    {/* Password Update Form */}
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-md border border-gh-border bg-gh-canvas-default p-6 lg:col-span-2 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Password</h2>
                            <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Set a new password for your account.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label htmlFor="currentPassword" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Current password</label>
                                <input
                                    id="currentPassword"
                                    className="w-full rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2.5 text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="newPassword" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">New password</label>
                                <input
                                    id="newPassword"
                                    className="w-full rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2.5 text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={saving === "password"}
                            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving === "password" ? "Updating..." : "Update password"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
