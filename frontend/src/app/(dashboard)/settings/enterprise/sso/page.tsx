"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  useSSOConfig,
  useCreateSSOConfig,
  useUpdateSSOConfig,
  useDeleteSSOConfig,
  useSSOMetadata,
  useValidateSSOConfig,
  useActivateSSOConfig,
  SSOProvider,
  SSOConfigStatus,
  getSSOProviderLabel,
  getSSOStatusLabel,
  getSSOStatusColor,
  CreateSSOConfigData,
} from "@/hooks/useEnterprise";
import {
  ArrowLeft,
  Clipboard,
  Check,
  AlertTriangle,
  Info,
} from "lucide-react";

const SSO_PROVIDERS: { value: SSOProvider; label: string; description: string }[] = [
  { value: "saml", label: "SAML 2.0", description: "Standard SAML 2.0 identity provider" },
  { value: "oidc", label: "OpenID Connect", description: "Standard OIDC provider" },
  { value: "azure_ad", label: "Azure Active Directory", description: "Microsoft Azure AD" },
  { value: "okta", label: "Okta", description: "Okta Identity Cloud" },
  { value: "google_workspace", label: "Google Workspace", description: "Google Workspace SSO" },
  { value: "onelogin", label: "OneLogin", description: "OneLogin Identity" },
];

export default function SSOConfigPage() {
  const { data: ssoConfig, isLoading } = useSSOConfig();
  const { data: metadata } = useSSOMetadata();
  const createSSO = useCreateSSOConfig();
  const updateSSO = useUpdateSSOConfig();
  const deleteSSO = useDeleteSSOConfig();
  const validateSSO = useValidateSSOConfig();
  const activateSSO = useActivateSSOConfig();

  const [provider, setProvider] = useState<SSOProvider>("saml");
  const [domain, setDomain] = useState("");
  const [enforceSso, setEnforceSso] = useState(false);
  const [autoProvision, setAutoProvision] = useState(true);
  const [defaultRole, setDefaultRole] = useState("member");

  // SAML fields
  const [samlEntityId, setSamlEntityId] = useState("");
  const [samlSsoUrl, setSamlSsoUrl] = useState("");
  const [samlSloUrl, setSamlSloUrl] = useState("");
  const [samlCertificate, setSamlCertificate] = useState("");

  // OIDC fields
  const [oidcIssuer, setOidcIssuer] = useState("");
  const [oidcClientId, setOidcClientId] = useState("");
  const [oidcClientSecret, setOidcClientSecret] = useState("");

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (ssoConfig) {
      setProvider(ssoConfig.provider);
      setDomain(ssoConfig.domain || "");
      setEnforceSso(ssoConfig.enforce_sso);
      setAutoProvision(ssoConfig.auto_provision);
      setDefaultRole(ssoConfig.default_role);
      setSamlEntityId(ssoConfig.saml_entity_id || "");
      setSamlSsoUrl(ssoConfig.saml_sso_url || "");
      setSamlSloUrl(ssoConfig.saml_slo_url || "");
      setOidcIssuer(ssoConfig.oidc_issuer || "");
      setOidcClientId(ssoConfig.oidc_client_id || "");
    }
  }, [ssoConfig]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = async () => {
    setMessage(null);
    const data: CreateSSOConfigData = {
      provider,
      domain: domain || undefined,
      enforce_sso: enforceSso,
      auto_provision: autoProvision,
      default_role: defaultRole,
    };

    if (provider === "saml") {
      data.saml_entity_id = samlEntityId || undefined;
      data.saml_sso_url = samlSsoUrl || undefined;
      data.saml_slo_url = samlSloUrl || undefined;
      if (samlCertificate) data.saml_certificate = samlCertificate;
    } else {
      data.oidc_issuer = oidcIssuer || undefined;
      data.oidc_client_id = oidcClientId || undefined;
      if (oidcClientSecret) data.oidc_client_secret = oidcClientSecret;
    }

    try {
      if (ssoConfig) {
        await updateSSO.mutateAsync(data);
      } else {
        await createSSO.mutateAsync(data);
      }
      setMessage({ type: "success", text: "SSO configuration saved successfully" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save SSO configuration" });
    }
  };

  const handleValidate = async () => {
    setValidationResult(null);
    try {
      const result = await validateSSO.mutateAsync();
      if (result) {
        setValidationResult(result);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to validate configuration" });
    }
  };

  const handleActivate = async () => {
    setMessage(null);
    try {
      await activateSSO.mutateAsync();
      setMessage({ type: "success", text: "SSO activated successfully!" });
    } catch (error: any) {
      const detail = error?.detail;
      if (detail?.errors) {
        setValidationResult({ valid: false, errors: detail.errors, warnings: [] });
      }
      setMessage({ type: "error", text: detail?.message || "Failed to activate SSO" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete the SSO configuration? Users will need to use password authentication.")) {
      return;
    }
    try {
      await deleteSSO.mutateAsync();
      setMessage({ type: "success", text: "SSO configuration deleted" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete SSO configuration" });
    }
  };

  const isSAML = provider === "saml";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/settings/enterprise"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Single Sign-On (SSO)</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure SSO to allow users to sign in with your identity provider
          </p>
        </div>
        {ssoConfig && (
          <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getSSOStatusColor(ssoConfig.status)}`}>
            {getSSOStatusLabel(ssoConfig.status)}
          </span>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {/* Service Provider Metadata */}
      {metadata && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Service Provider Metadata</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Use these values when configuring OmniTrackIQ in your identity provider:
              </p>
              <div className="mt-3 space-y-2">
                <MetadataField
                  label="Entity ID / Issuer"
                  value={metadata.entity_id}
                  copied={copiedField === "entity_id"}
                  onCopy={() => copyToClipboard(metadata.entity_id, "entity_id")}
                />
                <MetadataField
                  label="ACS URL (Assertion Consumer Service)"
                  value={metadata.acs_url}
                  copied={copiedField === "acs_url"}
                  onCopy={() => copyToClipboard(metadata.acs_url, "acs_url")}
                />
                <MetadataField
                  label="SLO URL (Single Logout)"
                  value={metadata.slo_url}
                  copied={copiedField === "slo_url"}
                  onCopy={() => copyToClipboard(metadata.slo_url, "slo_url")}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Result */}
      {validationResult && (
        <div className={`p-4 rounded-lg ${validationResult.valid ? "bg-green-50" : "bg-red-50"}`}>
          <div className="flex items-start gap-3">
            {validationResult.valid ? (
              <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <div>
              <h3 className={`font-medium ${validationResult.valid ? "text-green-900" : "text-red-900"}`}>
                {validationResult.valid ? "Configuration is valid" : "Configuration has errors"}
              </h3>
              {validationResult.errors.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                  {validationResult.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              )}
              {validationResult.warnings.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-sm text-yellow-700">
                  {validationResult.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Identity Provider Configuration</h2>
        </div>
        <div className="p-4 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Identity Provider
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SSO_PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setProvider(p.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    provider === p.value
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <p className={`font-medium ${provider === p.value ? "text-indigo-600" : "text-gray-900 dark:text-white"}`}>
                    {p.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Users with this email domain will be redirected to SSO login
            </p>
          </div>

          {/* SAML Configuration */}
          {isSAML ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IdP Entity ID
                </label>
                <input
                  type="text"
                  value={samlEntityId}
                  onChange={(e) => setSamlEntityId(e.target.value)}
                  placeholder="https://idp.example.com/metadata"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SSO URL
                </label>
                <input
                  type="text"
                  value={samlSsoUrl}
                  onChange={(e) => setSamlSsoUrl(e.target.value)}
                  placeholder="https://idp.example.com/sso"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SLO URL (Optional)
                </label>
                <input
                  type="text"
                  value={samlSloUrl}
                  onChange={(e) => setSamlSloUrl(e.target.value)}
                  placeholder="https://idp.example.com/slo"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  X.509 Certificate
                  {ssoConfig?.saml_certificate_configured && (
                    <span className="ml-2 text-green-600 text-xs">(Configured)</span>
                  )}
                </label>
                <textarea
                  value={samlCertificate}
                  onChange={(e) => setSamlCertificate(e.target.value)}
                  placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Issuer URL
                </label>
                <input
                  type="text"
                  value={oidcIssuer}
                  onChange={(e) => setOidcIssuer(e.target.value)}
                  placeholder="https://login.example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={oidcClientId}
                  onChange={(e) => setOidcClientId(e.target.value)}
                  placeholder="your-client-id"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client Secret
                  {ssoConfig?.oidc_client_secret_configured && (
                    <span className="ml-2 text-green-600 text-xs">(Configured)</span>
                  )}
                </label>
                <input
                  type="password"
                  value={oidcClientSecret}
                  onChange={(e) => setOidcClientSecret(e.target.value)}
                  placeholder="Enter to update"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          {/* Options */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Enforce SSO</p>
                <p className="text-xs text-gray-500">Disable password login when SSO is active</p>
              </div>
              <button
                type="button"
                onClick={() => setEnforceSso(!enforceSso)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enforceSso ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enforceSso ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-provision Users</p>
                <p className="text-xs text-gray-500">Create accounts for new users on first SSO login</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoProvision(!autoProvision)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoProvision ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoProvision ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Role for New Users
              </label>
              <select
                value={defaultRole}
                onChange={(e) => setDefaultRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {ssoConfig && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                Delete Configuration
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {ssoConfig && ssoConfig.status !== "active" && (
              <button
                type="button"
                onClick={handleValidate}
                disabled={validateSSO.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Validate
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={createSSO.isPending || updateSSO.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              {createSSO.isPending || updateSSO.isPending ? "Saving..." : "Save Configuration"}
            </button>
            {ssoConfig && ssoConfig.status !== "active" && (
              <button
                type="button"
                onClick={handleActivate}
                disabled={activateSSO.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
              >
                {activateSSO.isPending ? "Activating..." : "Activate SSO"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetadataField({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-blue-700 dark:text-blue-300 w-48 flex-shrink-0">{label}:</span>
      <code className="flex-1 text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded truncate">
        {value}
      </code>
      <button
        type="button"
        onClick={onCopy}
        className="p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Clipboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        )}
      </button>
    </div>
  );
}
