'use client';

import { apiFetch } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

// Backend response structure from /billing/me
interface BackendBillingResponse {
  plan: string | null;
  status: string;
  renewal: string | null; // ISO datetime string
}

// Frontend billing info structure
export interface BillingInfo {
  plan: string | null;
  status: string | null;
  nextPaymentDate: string | null;
  subscriptionId: string | null;
}

export interface UseBillingResult {
  billing: BillingInfo | null;
  loading: boolean;
  error: string | null;
  createCheckout: (plan: string) => Promise<void>;
  openPortal: () => Promise<void>;
  reload: () => void;
}

export function useBilling(): UseBillingResult {
  const {
    data,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery<BackendBillingResponse>({
    queryKey: ['billing'],
    queryFn: () => apiFetch<BackendBillingResponse>('/billing/me'),
    retry: false,
  });

  // Map backend response to frontend BillingInfo structure
  const billing: BillingInfo | null = data
    ? {
        plan: data.plan,
        status: data.status,
        nextPaymentDate: data.renewal,
        subscriptionId: null, // Not provided by backend currently
      }
    : null;

  async function createCheckout(plan: string) {
    const { url } = await apiFetch<{ url: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });

    // Redirect to Stripe checkout
    window.location.href = url;
  }

  async function openPortal() {
    const { url } = await apiFetch<{ url: string }>('/billing/portal', {
      method: 'POST',
    });

    // Redirect to billing portal
    window.location.href = url;
  }

  return {
    billing,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    createCheckout,
    openPortal,
    reload: refetch,
  };
}
