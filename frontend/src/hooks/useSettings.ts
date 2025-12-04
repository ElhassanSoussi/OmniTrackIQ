"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

export interface AccountSettings {
  id: string;
  email: string;
  name?: string;
  account_id?: string;
  account_name?: string;
}

export function useSettings() {
  const [account, setAccount] = useState<AccountSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<null | "account" | "email" | "password">(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await apiFetch<AccountSettings>("/auth/me");
      setAccount(me);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load settings";
      setError(msg);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function updateAccount(accountName?: string, name?: string) {
    setSaving("account");
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/auth/update-account", {
        method: "POST",
        body: JSON.stringify({ account_name: accountName, name }),
      });
      setMessage("Account details updated");
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update account";
      setError(msg);
      throw err;
    } finally {
      setSaving(null);
    }
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
      const msg = err instanceof Error ? err.message : "Failed to update email";
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
      const msg = err instanceof Error ? err.message : "Failed to update password";
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
    updateAccount,
    updateEmail,
    updatePassword,
  };
}
