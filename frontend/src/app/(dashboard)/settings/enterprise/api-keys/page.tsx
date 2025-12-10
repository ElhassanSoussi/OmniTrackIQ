"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAPIKeys,
  useCreateAPIKey,
  useRevokeAPIKey,
  APIKey,
  formatAPIKeyExpiry,
} from "@/hooks/useEnterprise";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clipboard,
  Check,
  Key,
  AlertTriangle,
} from "lucide-react";

export default function APIKeysPage() {
  const { data: apiKeys, isLoading } = useAPIKeys();
  const createKey = useCreateAPIKey();
  const revokeKey = useRevokeAPIKey();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyResult, setNewKeyResult] = useState<{ key: APIKey; fullKey: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Create form state
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);
  const [expiresInDays, setExpiresInDays] = useState<number | "">(90);
  const [rateLimit, setRateLimit] = useState<number | "">(100);

  const handleCreate = async () => {
    try {
      const result = await createKey.mutateAsync({
        name,
        scopes,
        expires_in_days: expiresInDays ? Number(expiresInDays) : undefined,
        rate_limit: rateLimit ? Number(rateLimit) : undefined,
      });
      if (result) {
        setNewKeyResult({ key: result.api_key, fullKey: result.full_key });
      }
      setShowCreateModal(false);
      setName("");
      setScopes(["read"]);
      setExpiresInDays(90);
      setRateLimit(100);
    } catch (error) {
      console.error("Failed to create API key:", error);
    }
  };

  const handleRevoke = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to revoke the API key "${keyName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await revokeKey.mutateAsync(keyId);
    } catch (error) {
      console.error("Failed to revoke API key:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleScope = (scope: string) => {
    if (scopes.includes(scope)) {
      setScopes(scopes.filter((s) => s !== scope));
    } else {
      setScopes([...scopes, scope]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings/enterprise"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">API Keys</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage API keys for programmatic access
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      {/* New Key Created Banner */}
      {newKeyResult && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-green-900 dark:text-green-100">
                API Key Created Successfully
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Copy your API key now. You won&apos;t be able to see it again!
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/50 rounded font-mono text-sm">
                  {newKeyResult.fullKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newKeyResult.fullKey)}
                  className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/50"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clipboard className="h-5 w-5 text-green-600" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setNewKeyResult(null)}
                className="mt-3 text-sm text-green-600 hover:text-green-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : apiKeys && apiKeys.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Key className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{key.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <code className="text-xs text-gray-500 font-mono">{key.key_prefix}...</code>
                      <span className="text-xs text-gray-500">
                        Scopes: {key.scopes.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-gray-500">{formatAPIKeyExpiry(key.expires_at)}</p>
                    <p className="text-xs text-gray-400">
                      {key.usage_count} requests
                      {key.last_used_at && ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevoke(key.id, key.name)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Revoke key"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Key className="h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">No API keys yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-500"
            >
              Create your first API key
            </button>
          </div>
        )}
      </div>

      {/* Usage Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-100">Using API Keys</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          Include your API key in the <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">Authorization</code> header:
        </p>
        <pre className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/50 rounded text-sm font-mono overflow-x-auto">
          Authorization: Bearer otiq_xxxxxxxxxxxxx
        </pre>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Create API Key</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My API Key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="flex flex-wrap gap-2">
                  {["read", "write", "admin"].map((scope) => (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => toggleScope(scope)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        scopes.includes(scope)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {scope}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {scopes.includes("admin") && (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      Admin scope grants full access
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiration (days)
                </label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Leave empty for no expiration"
                  min={1}
                  max={365}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rate Limit (requests/minute)
                </label>
                <input
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Leave empty for default"
                  min={1}
                  max={10000}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name || scopes.length === 0 || createKey.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                {createKey.isPending ? "Creating..." : "Create Key"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
