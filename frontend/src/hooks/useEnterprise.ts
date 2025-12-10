"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// ================== Types ==================

// SSO Types
export type SSOProvider = "saml" | "oidc" | "azure_ad" | "okta" | "google_workspace" | "onelogin";
export type SSOConfigStatus = "draft" | "testing" | "active" | "disabled";

export interface SSOConfig {
  id: string;
  provider: SSOProvider;
  status: SSOConfigStatus;
  domain: string | null;
  enforce_sso: boolean;
  auto_provision: boolean;
  default_role: string;
  
  // SAML
  saml_entity_id: string | null;
  saml_sso_url: string | null;
  saml_slo_url: string | null;
  saml_certificate_configured: boolean;
  
  // OIDC
  oidc_issuer: string | null;
  oidc_client_id: string | null;
  oidc_client_secret_configured: boolean;
  
  attribute_mapping: Record<string, string>;
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
}

export interface CreateSSOConfigData {
  provider: SSOProvider;
  domain?: string;
  enforce_sso?: boolean;
  auto_provision?: boolean;
  default_role?: string;
  
  // SAML fields
  saml_entity_id?: string;
  saml_sso_url?: string;
  saml_slo_url?: string;
  saml_certificate?: string;
  saml_name_id_format?: string;
  
  // OIDC fields
  oidc_issuer?: string;
  oidc_client_id?: string;
  oidc_client_secret?: string;
  oidc_authorization_endpoint?: string;
  oidc_token_endpoint?: string;
  oidc_userinfo_endpoint?: string;
  oidc_jwks_uri?: string;
  
  attribute_mapping?: Record<string, string>;
}

export interface UpdateSSOConfigData extends Partial<CreateSSOConfigData> {
  status?: SSOConfigStatus;
}

export interface SSOMetadata {
  entity_id: string;
  acs_url: string;
  slo_url: string;
  name_id_format: string;
}

export interface SSOValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Audit Log Types
export type AuditAction = 
  | "login" | "logout" | "login_failed" | "sso_login" 
  | "password_changed" | "password_reset"
  | "user_created" | "user_updated" | "user_deleted" | "user_invited" | "user_role_changed"
  | "account_updated" | "plan_changed" | "billing_updated"
  | "integration_connected" | "integration_disconnected" | "integration_synced"
  | "report_viewed" | "report_exported" | "data_exported"
  | "sso_config_updated" | "api_key_created" | "api_key_revoked" | "permission_changed"
  | "client_created" | "client_updated" | "client_archived" | "client_access_granted" | "client_access_revoked";

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: AuditAction;
  severity: AuditSeverity;
  resource_type: string | null;
  resource_id: string | null;
  resource_name: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface AuditLogListResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditLogFilters {
  action?: AuditAction;
  user_id?: string;
  resource_type?: string;
  severity?: AuditSeverity;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  period_days: number;
  total_events: number;
  failed_events: number;
  unique_users: number;
  by_action: Record<string, number>;
  by_severity: Record<string, number>;
}

// Data Retention Types
export interface DataRetentionPolicy {
  id: string;
  metrics_retention_days: number;
  orders_retention_days: number;
  audit_logs_retention_days: number;
  reports_retention_days: number;
  auto_delete_enabled: boolean;
  export_before_delete: boolean;
  export_destination: string | null;
  last_cleanup_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateRetentionPolicyData {
  metrics_retention_days?: number;
  orders_retention_days?: number;
  audit_logs_retention_days?: number;
  reports_retention_days?: number;
  auto_delete_enabled?: boolean;
  export_before_delete?: boolean;
  export_destination?: string;
}

export interface UpdateRetentionPolicyData extends Partial<CreateRetentionPolicyData> {}

// API Key Types
export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  allowed_ips: string[] | null;
  rate_limit: number | null;
  expires_at: string | null;
  last_used_at: string | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateAPIKeyData {
  name: string;
  scopes?: string[];
  allowed_ips?: string[];
  rate_limit?: number;
  expires_in_days?: number;
}

export interface APIKeyCreatedResponse {
  api_key: APIKey;
  full_key: string;
}

// Enterprise Overview Types
export interface EnterpriseOverview {
  sso: {
    configured: boolean;
    provider: SSOProvider | null;
    status: SSOConfigStatus | null;
    enforce_sso: boolean;
  };
  data_retention: {
    configured: boolean;
    auto_delete_enabled: boolean;
    metrics_retention_days: number;
  };
  api_keys: {
    count: number;
    active_count: number;
  };
  audit: AuditSummary;
}

// ================== SSO Hooks ==================

export function useSSOConfig() {
  return useQuery({
    queryKey: ["enterprise", "sso"],
    queryFn: async () => {
      const response = await apiFetch<SSOConfig | null>("/enterprise/sso");
      return response;
    },
  });
}

export function useCreateSSOConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSSOConfigData) => {
      return apiFetch<SSOConfig>("/enterprise/sso", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise", "sso"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise", "overview"] });
    },
  });
}

export function useUpdateSSOConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateSSOConfigData) => {
      return apiFetch<SSOConfig>("/enterprise/sso", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise", "sso"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise", "overview"] });
    },
  });
}

export function useDeleteSSOConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiFetch("/enterprise/sso", {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise", "sso"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise", "overview"] });
    },
  });
}

export function useSSOMetadata() {
  return useQuery({
    queryKey: ["enterprise", "sso", "metadata"],
    queryFn: async () => {
      return apiFetch<SSOMetadata>("/enterprise/sso/metadata");
    },
  });
}

export function useValidateSSOConfig() {
  return useMutation({
    mutationFn: async () => {
      return apiFetch<SSOValidation>("/enterprise/sso/validate", {
        method: "POST",
      });
    },
  });
}

export function useActivateSSOConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiFetch<SSOConfig>("/enterprise/sso/activate", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise", "sso"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise", "overview"] });
    },
  });
}

// ================== Audit Log Hooks ==================

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const params = new URLSearchParams();
  if (filters.action) params.set("action", filters.action);
  if (filters.user_id) params.set("user_id", filters.user_id);
  if (filters.resource_type) params.set("resource_type", filters.resource_type);
  if (filters.severity) params.set("severity", filters.severity);
  if (filters.from_date) params.set("from_date", filters.from_date);
  if (filters.to_date) params.set("to_date", filters.to_date);
  if (filters.limit) params.set("limit", filters.limit.toString());
  if (filters.offset) params.set("offset", filters.offset.toString());
  
  const queryString = params.toString();
  
  return useQuery({
    queryKey: ["enterprise", "audit-logs", filters],
    queryFn: async () => {
      const url = queryString ? `/enterprise/audit-logs?${queryString}` : "/enterprise/audit-logs";
      return apiFetch<AuditLogListResponse>(url);
    },
  });
}

export function useAuditSummary(days: number = 30) {
  return useQuery({
    queryKey: ["enterprise", "audit-logs", "summary", days],
    queryFn: async () => {
      return apiFetch<AuditSummary>(`/enterprise/audit-logs/summary?days=${days}`);
    },
  });
}

// ================== Data Retention Hooks ==================

export function useRetentionPolicy() {
  return useQuery({
    queryKey: ["enterprise", "retention"],
    queryFn: async () => {
      return apiFetch<DataRetentionPolicy | null>("/enterprise/retention");
    },
  });
}

export function useCreateRetentionPolicy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateRetentionPolicyData) => {
      return apiFetch<DataRetentionPolicy>("/enterprise/retention", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise", "retention"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise", "overview"] });
    },
  });
}

export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateRetentionPolicyData) => {
      return apiFetch<DataRetentionPolicy>("/enterprise/retention", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise", "retention"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise", "overview"] });
    },
  });
}

// ================== API Key Hooks ==================

export function useAPIKeys(includeRevoked: boolean = false) {
  return useQuery({
    queryKey: ["enterprise", "api-keys", { includeRevoked }],
    queryFn: async () => {
      const url = includeRevoked 
        ? "/enterprise/api-keys?include_revoked=true" 
        : "/enterprise/api-keys";
      return apiFetch<APIKey[]>(url);
    },
  });
}

export function useCreateAPIKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateAPIKeyData) => {
      return apiFetch<APIKeyCreatedResponse>("/enterprise/api-keys", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise", "api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise", "overview"] });
    },
  });
}

export function useRevokeAPIKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (keyId: string) => {
      await apiFetch(`/enterprise/api-keys/${keyId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise", "api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise", "overview"] });
    },
  });
}

// ================== Enterprise Overview Hook ==================

export function useEnterpriseOverview() {
  return useQuery({
    queryKey: ["enterprise", "overview"],
    queryFn: async () => {
      return apiFetch<EnterpriseOverview>("/enterprise/overview");
    },
  });
}

// ================== Helper Functions ==================

export function getSSOProviderLabel(provider: SSOProvider): string {
  const labels: Record<SSOProvider, string> = {
    saml: "SAML 2.0",
    oidc: "OpenID Connect",
    azure_ad: "Azure Active Directory",
    okta: "Okta",
    google_workspace: "Google Workspace",
    onelogin: "OneLogin",
  };
  return labels[provider] || provider;
}

export function getSSOStatusLabel(status: SSOConfigStatus): string {
  const labels: Record<SSOConfigStatus, string> = {
    draft: "Draft",
    testing: "Testing",
    active: "Active",
    disabled: "Disabled",
  };
  return labels[status] || status;
}

export function getSSOStatusColor(status: SSOConfigStatus): string {
  const colors: Record<SSOConfigStatus, string> = {
    draft: "bg-gray-100 text-gray-800",
    testing: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    disabled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getAuditActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    login: "Login",
    logout: "Logout",
    login_failed: "Login Failed",
    sso_login: "SSO Login",
    password_changed: "Password Changed",
    password_reset: "Password Reset",
    user_created: "User Created",
    user_updated: "User Updated",
    user_deleted: "User Deleted",
    user_invited: "User Invited",
    user_role_changed: "Role Changed",
    account_updated: "Account Updated",
    plan_changed: "Plan Changed",
    billing_updated: "Billing Updated",
    integration_connected: "Integration Connected",
    integration_disconnected: "Integration Disconnected",
    integration_synced: "Integration Synced",
    report_viewed: "Report Viewed",
    report_exported: "Report Exported",
    data_exported: "Data Exported",
    sso_config_updated: "SSO Config Updated",
    api_key_created: "API Key Created",
    api_key_revoked: "API Key Revoked",
    permission_changed: "Permission Changed",
    client_created: "Client Created",
    client_updated: "Client Updated",
    client_archived: "Client Archived",
    client_access_granted: "Client Access Granted",
    client_access_revoked: "Client Access Revoked",
  };
  return labels[action] || action;
}

export function getAuditSeverityColor(severity: AuditSeverity): string {
  const colors: Record<AuditSeverity, string> = {
    info: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    critical: "bg-red-100 text-red-800",
  };
  return colors[severity] || "bg-gray-100 text-gray-800";
}

export function formatRetentionPeriod(days: number): string {
  if (days === 0) return "Indefinite";
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  return `${Math.round(days / 365)} years`;
}

export function formatAPIKeyExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "Never expires";
  const date = new Date(expiresAt);
  const now = new Date();
  if (date < now) return "Expired";
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return `Expires in ${diffDays} days`;
  return `Expires ${date.toLocaleDateString()}`;
}
