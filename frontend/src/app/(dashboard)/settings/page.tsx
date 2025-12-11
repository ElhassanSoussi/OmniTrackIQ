"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { account, loading, error, saving, message, updateAccount, updateEmail, updatePassword } = useSettings();

  const [accountName, setAccountName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setAccountName(account.account_name || "");
      setName(account.name || "");
      setEmail(account.email || "");
    }
  }, [account]);

  useEffect(() => {
    if (message) {
      setLocalMessage(message);
      // Auto-clear success message after 3 seconds
      const timeout = setTimeout(() => setLocalMessage(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  async function handleAccountSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setLocalMessage(null);
    try {
      await updateAccount(accountName, name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to update account";
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
        <h1 className="text-xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Settings</h1>
        <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Manage your account profile, login email, and password.</p>
      </div>

      {/* Settings Navigation */}
      <div className="flex gap-2 border-b border-gh-border dark:border-gh-border-dark overflow-x-auto">
        <a href="/settings" className="border-b-2 border-brand-500 px-4 py-2 text-sm font-medium text-brand-500 dark:text-brand-400 whitespace-nowrap">
          Profile
        </a>
        <a href="/settings/team" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gh-text-secondary hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:text-gh-text-primary-dark whitespace-nowrap">
          Team
        </a>
        <a href="/settings/notifications" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gh-text-secondary hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:text-gh-text-primary-dark whitespace-nowrap">
          Notifications
        </a>
        <a href="/settings/views" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gh-text-secondary hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:text-gh-text-primary-dark whitespace-nowrap">
          Saved Views
        </a>
        <a href="/settings/reports" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gh-text-secondary hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:text-gh-text-primary-dark whitespace-nowrap">
          Reports
        </a>
        <a href="/settings/appearance" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gh-text-secondary hover:text-gh-text-primary dark:text-gh-text-secondary-dark dark:hover:text-gh-text-primary-dark whitespace-nowrap">
          Appearance
        </a>
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
          <form onSubmit={handleAccountSubmit} className="space-y-4 rounded-md border border-gh-border bg-gh-canvas-default p-6 dark:border-gh-border-dark dark:bg-gh-canvas-dark">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Account</h2>
              <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Update your workspace details that appear across dashboards.</p>
            </div>
            <div className="space-y-1">
              <label htmlFor="accountName" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Account name</label>
              <input
                id="accountName"
                className="w-full rounded-md border border-gh-border bg-gh-canvas-default px-3 py-2.5 text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gh-border-dark dark:bg-gh-canvas-dark dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
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
            <button
              type="submit"
              disabled={saving === "account"}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving === "account" ? "Saving..." : "Save changes"}
            </button>
          </form>

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
