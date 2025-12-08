'use client';

import { apiFetch } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

// Backend response structure from /billing/me
interface BillingPlan {
  plan: string | null;
  plan_name: string;
  status: string;
  renewal: string | null; // ISO datetime string
  features: string[];
  can_upgrade: boolean;
  can_cancel: boolean;
}

// Frontend billing info structure
export interface BillingInfo {
  plan: string | null;
  plan_name: string | null;
  status: string | null;
  renewal: string | null;
  features: string[];
  can_upgrade: boolean;
  can_cancel: boolean;
}

export interface UseBillingResult {
  billing: BillingInfo | null;
  loading: boolean;
  error: string | null;
  createCheckout: (plan: string) => Promise<void>;
  openPortal: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  reload: () => void;
}

export function useBilling(): UseBillingResult {
  const {
    data,
    refetch,
    isLoading,
    error,
  } = useQuery<BillingPlan | undefined>({
    queryKey: ['billing'],
    queryFn: async () => {
      const result = await apiFetch<BillingPlan>('/billing/me');
      return result as BillingPlan;
    },
    retry: false,
  });

  // Map backend response to frontend BillingInfo structure
  const billing: BillingInfo | null = data
    ? {
        plan: data.plan,
        plan_name: data.plan_name,
        status: data.status,
        renewal: data.renewal,
        features: data.features || [],
        can_upgrade: data.can_upgrade ?? true,
        can_cancel: data.can_cancel ?? false,
      }
    : null;

  async function createCheckout(plan: string) {
    const result = await apiFetch<{ url: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });

    if (!result?.url) {
      throw new Error('No checkout URL received');
    }

    // Redirect to Stripe checkout
    window.location.href = result.url;
  }

  async function openPortal() {
    const result = await apiFetch<{ url: string }>('/billing/portal', {
      method: 'POST',
    });

    if (!result?.url) {
      throw new Error('No portal URL received');
    }

    // Redirect to billing portal
    window.location.href = result.url;
  }

  async function cancelSubscription() {
    await apiFetch('/billing/cancel', {
      method: 'POST',
    });
    refetch();
  }

  async function reactivateSubscription() {
    await apiFetch('/billing/reactivate', {
      method: 'POST',
    });
    refetch();
  }

  return {
    billing,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    createCheckout,
    openPortal,
    cancelSubscription,
    reactivateSubscription,
    reload: refetch,
  };
}
