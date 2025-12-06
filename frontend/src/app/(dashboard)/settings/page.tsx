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
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Manage your account profile, login email, and password.</p>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading settings...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleAccountSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-inner shadow-black/10">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white">Account</h2>
              <p className="text-sm text-slate-400">Update your workspace details that appear across dashboards.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Account name</label>
              <input
                className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Display name</label>
              <input
                className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <button
              type="submit"
              disabled={saving === "account"}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
            >
              {saving === "account" ? "Saving..." : "Save changes"}
            </button>
          </form>

          <form onSubmit={handleEmailSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-inner shadow-black/10">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white">Login email</h2>
              <p className="text-sm text-slate-400">Change the email you use to sign in.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Email</label>
              <input
                className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving === "email"}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
            >
              {saving === "email" ? "Updating..." : "Update email"}
            </button>
          </form>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-inner shadow-black/10 lg:col-span-2">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white">Password</h2>
              <p className="text-sm text-slate-400">Set a new password for your account.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Current password</label>
                <input
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">New password</label>
                <input
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving === "password"}
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
              >
                {saving === "password" ? "Updating..." : "Update password"}
              </button>
              {localMessage && <span className="text-sm text-emerald-300">{localMessage}</span>}
              {localError && <span className="text-sm text-rose-300">{localError}</span>}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
