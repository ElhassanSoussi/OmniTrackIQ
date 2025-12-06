'use client';

import { apiFetch } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

type BillingPlan = {
  // Whatever /billing/me returns – keep it loose but at least include plan
  plan?: string | null;
  status?: string | null;
  renews_at?: string | null;
  // allow extra fields without TypeScript complaining
  [key: string]: unknown;
};

type UseBillingResult = {
  plan: BillingPlan | undefined;
  reload: () => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  createCheckout: (plan: string) => Promise<void>;
  openPortal: () => Promise<void>;
};

export function useBilling(): UseBillingResult {
  const {
    data,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery<BillingPlan | undefined>({
    queryKey: ['billing'],
    queryFn: async () => {
      const result = await apiFetch<BillingPlan>('/billing/me');
      return result as BillingPlan;
    },
    retry: false,
  });

  async function createCheckout(plan: string) {
    const result = await apiFetch<{ url: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });

    // Redirect to Stripe checkout
    if (result?.url) {
      window.location.href = result.url;
    }
  }

  async function openPortal() {
    const result = await apiFetch<{ url: string }>('/billing/portal', {
      method: 'POST',
    });

    // Redirect to billing portal
    if (result?.url) {
      window.location.href = result.url;
    }
  }

  return {
    plan: data,
    reload: refetch,
    isLoading,
    isError,
    error: (error as Error) ?? null,
    createCheckout,
    openPortal,
  };
}
