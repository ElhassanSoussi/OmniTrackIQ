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
  } = useQuery<BillingPlan>({
    queryKey: ['billing'],
    queryFn: () => apiFetch<BillingPlan>('/billing/me'),
    retry: false,
  });

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
    plan: data,
    reload: refetch,
    isLoading,
    isError,
    error: (error as Error) ?? null,
    createCheckout,
    openPortal,
  };
}
