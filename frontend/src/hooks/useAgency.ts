"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// ================== Types ==================

export type ClientStatus = "active" | "paused" | "archived" | "pending_setup";

export interface ClientAccount {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  website: string | null;
  logo_url: string | null;
  status: ClientStatus;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  internal_notes?: string;
  settings: ClientSettings;
  branding: ClientBranding;
  created_at: string;
  updated_at?: string;
  last_accessed_at: string | null;
}

export interface ClientSettings {
  timezone: string;
  currency: string;
  date_format: string;
  white_label: boolean;
}

export interface ClientBranding {
  primary_color: string;
  logo_url: string | null;
  company_name: string | null;
  report_footer: string | null;
}

export interface ClientListResponse {
  clients: ClientAccount[];
  total: number;
}

export interface CreateClientData {
  name: string;
  industry?: string;
  website?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  internal_notes?: string;
}

export interface UpdateClientData {
  name?: string;
  industry?: string;
  website?: string;
  logo_url?: string;
  status?: ClientStatus;
  primary_contact_name?: string;
  primary_contact_email?: string;
  internal_notes?: string;
  settings?: Partial<ClientSettings>;
  branding?: Partial<ClientBranding>;
}

export interface ClientUserAccess {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  can_view: boolean;
  can_edit: boolean;
  can_manage: boolean;
  created_at: string;
}

export interface GrantAccessData {
  user_id: string;
  can_view?: boolean;
  can_edit?: boolean;
  can_manage?: boolean;
}

export interface AgencyDashboard {
  total_clients: number;
  active_clients: number;
  total_revenue: number;
  total_spend: number;
  total_roas: number;
  top_performing_clients: {
    id: string;
    name: string;
    revenue: number;
    roas: number;
  }[];
  clients_by_status: Record<ClientStatus, number>;
}

export interface ClientBenchmark {
  client_id: string;
  client_name: string;
  revenue: number;
  spend: number;
  roas: number;
  orders: number;
  aov: number;
  performance_rank: number;
}

export interface BenchmarksResponse {
  benchmarks: ClientBenchmark[];
}

export interface SwitchClientResponse {
  success: boolean;
  client: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    branding: ClientBranding | null;
  };
}

// ================== Queries ==================

/**
 * List all client accounts for the agency
 */
export function useClientAccounts(
  status?: ClientStatus,
  search?: string
) {
  return useQuery<ClientListResponse>({
    queryKey: ["agency", "clients", status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      const query = params.toString();
      const result = await apiFetch(
        `/agency/clients${query ? `?${query}` : ""}`
      );
      return result as ClientListResponse;
    },
  });
}

/**
 * Get a single client account by ID
 */
export function useClientAccount(clientId: string | null) {
  return useQuery<ClientAccount>({
    queryKey: ["agency", "client", clientId],
    queryFn: async () => {
      const result = await apiFetch(`/agency/clients/${clientId}`);
      return result as ClientAccount;
    },
    enabled: !!clientId,
  });
}

/**
 * Get users with access to a specific client
 */
export function useClientUsers(clientId: string | null) {
  return useQuery<{ users: ClientUserAccess[] }>({
    queryKey: ["agency", "client", clientId, "users"],
    queryFn: async () => {
      const result = await apiFetch(
        `/agency/clients/${clientId}/users`
      );
      return result as { users: ClientUserAccess[] };
    },
    enabled: !!clientId,
  });
}

/**
 * Get agency-level dashboard with cross-client summary
 */
export function useAgencyDashboard(from?: string, to?: string) {
  return useQuery<AgencyDashboard>({
    queryKey: ["agency", "dashboard", from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const query = params.toString();
      const result = await apiFetch(
        `/agency/dashboard${query ? `?${query}` : ""}`
      );
      return result as AgencyDashboard;
    },
  });
}

/**
 * Get performance benchmarks across all clients
 */
export function useClientBenchmarks(from?: string, to?: string) {
  return useQuery<BenchmarksResponse>({
    queryKey: ["agency", "benchmarks", from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const query = params.toString();
      const result = await apiFetch(
        `/agency/benchmarks${query ? `?${query}` : ""}`
      );
      return result as BenchmarksResponse;
    },
  });
}

/**
 * Get white-label branding configuration for a client
 */
export function useClientBranding(clientId: string | null) {
  return useQuery<ClientBranding>({
    queryKey: ["agency", "client", clientId, "branding"],
    queryFn: async () => {
      const result = await apiFetch(
        `/agency/clients/${clientId}/branding`
      );
      return result as ClientBranding;
    },
    enabled: !!clientId,
  });
}

// ================== Mutations ==================

/**
 * Create a new client account
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClientData) => {
      const result = await apiFetch<{ id: string; name: string; slug: string }>("/agency/clients", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard"] });
    },
  });
}

/**
 * Update a client account
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: UpdateClientData }) => {
      const result = await apiFetch<{ message: string; id: string }>(
        `/agency/clients/${clientId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "client", variables.clientId] });
    },
  });
}

/**
 * Archive a client account (soft delete)
 */
export function useArchiveClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const result = await apiFetch<{ message: string }>(
        `/agency/clients/${clientId}`,
        { method: "DELETE" }
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "clients"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard"] });
    },
  });
}

/**
 * Grant a user access to a client
 */
export function useGrantClientAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: GrantAccessData }) => {
      const result = await apiFetch<{ message: string; access_id: string }>(
        `/agency/clients/${clientId}/users`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency", "client", variables.clientId, "users"] });
    },
  });
}

/**
 * Revoke a user's access to a client
 */
export function useRevokeClientAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, userId }: { clientId: string; userId: string }) => {
      const result = await apiFetch<{ message: string }>(
        `/agency/clients/${clientId}/users/${userId}`,
        { method: "DELETE" }
      );
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency", "client", variables.clientId, "users"] });
    },
  });
}

/**
 * Update white-label branding for a client
 */
export function useUpdateClientBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      branding,
    }: {
      clientId: string;
      branding: Partial<ClientBranding>;
    }) => {
      const result = await apiFetch<{ message: string; branding: ClientBranding }>(
        `/agency/clients/${clientId}/branding`,
        {
          method: "PATCH",
          body: JSON.stringify(branding),
        }
      );
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency", "client", variables.clientId, "branding"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "client", variables.clientId] });
    },
  });
}

/**
 * Switch context to a specific client
 */
export function useSwitchClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const result = await apiFetch<SwitchClientResponse>(
        `/agency/clients/${clientId}/switch`,
        { method: "POST" }
      );
      return result;
    },
    onSuccess: () => {
      // Invalidate metrics and other data that depends on current client context
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
