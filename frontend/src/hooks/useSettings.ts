"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { formatErrorMessage } from "@/lib/format";

export interface AccountSettings {
  id: string;
  email: string;
  name?: string;
  account_id?: string;
  account_name?: string;
  avatar_url?: string;
  timezone?: string;
  industry?: string;
  currency?: string;
  role?: string;
}

export function useSettings() {
  const [account, setAccount] = useState<AccountSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<null | "profile" | "organization" | "email" | "password">(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await apiFetch<AccountSettings>("/auth/me");
      setAccount(me || null);
    } catch (err) {
      const msg = formatErrorMessage(err);
      setError(msg);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function updateProfile(name?: string, avatarUrl?: string, timezone?: string) {
    setSaving("profile");
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name, avatar_url: avatarUrl, timezone }),
      });
      setMessage("Profile updated successfully");
      await refresh();
    } catch (err) {
      const msg = formatErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setSaving(null);
    }
  }

  async function updateOrganization(name?: string, industry?: string, currency?: string, timezone?: string) {
    setSaving("organization");
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/auth/account/me", {
        method: "PATCH",
        body: JSON.stringify({ name, industry, currency, timezone }),
      });
      setMessage("Organization updated successfully");
      await refresh();
    } catch (err) {
      const msg = formatErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setSaving(null);
    }
  }

  // Deprecated wrapper
  async function updateAccount(accountName?: string, name?: string) {
    if (name) await updateProfile(name);
    if (accountName) await updateOrganization(accountName);
  }

  async function updateEmail(email: string) {
    setSaving("email");
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/auth/update-email", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage("Email updated");
      await refresh();
    } catch (err) {
      const msg = formatErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setSaving(null);
    }
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    setSaving("password");
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/auth/update-password", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setMessage("Password updated");
    } catch (err) {
      const msg = formatErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setSaving(null);
    }
  }

  return {
    account,
    loading,
    error,
    saving,
    message,
    refresh,
    updateProfile,
    updateOrganization,
    updateAccount,
    updateEmail,
    updatePassword,
  };
}
