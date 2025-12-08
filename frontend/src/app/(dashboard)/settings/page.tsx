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
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account profile, login email, and password.</p>
      </div>

      {/* Settings Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <a href="/settings" className="border-b-2 border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600">
          Profile
        </a>
        <a href="/settings/team" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Team
        </a>
        <a href="/settings/views" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Saved Views
        </a>
      </div>

      {/* Toast messages */}
      {localMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✓ {localMessage}
        </div>
      )}
      {localError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
          Loading settings...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleAccountSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Account</h2>
              <p className="text-sm text-gray-500">Update your workspace details that appear across dashboards.</p>
            </div>
            <div className="space-y-1">
              <label htmlFor="accountName" className="text-sm font-medium text-gray-700">Account name</label>
              <input
                id="accountName"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="displayName" className="text-sm font-medium text-gray-700">Display name</label>
              <input
                id="displayName"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <button
              type="submit"
              disabled={saving === "account"}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving === "account" ? "Saving..." : "Save changes"}
            </button>
          </form>

          <form onSubmit={handleEmailSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Login email</h2>
              <p className="text-sm text-gray-500">Change the email you use to sign in.</p>
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving === "email"}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving === "email" ? "Updating..." : "Update email"}
            </button>
          </form>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900">Password</h2>
              <p className="text-sm text-gray-500">Set a new password for your account.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current password</label>
                <input
                  id="currentPassword"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New password</label>
                <input
                  id="newPassword"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving === "password" ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
