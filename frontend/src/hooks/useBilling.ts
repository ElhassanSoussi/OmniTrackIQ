'use client';

import { apiFetch } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

// Subscription status types matching backend
export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'canceled' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'none';

export type PlanType = 'free' | 'starter' | 'pro' | 'agency' | 'enterprise';

// Backend response structure from /billing/status
interface BillingStatusResponse {
  plan: PlanType;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  stripe_customer_portal_available: boolean;
  features: string[];
  can_upgrade: boolean;
  can_cancel: boolean;
  billing_configured: boolean;
}

// Legacy backend response from /billing/me
interface BillingPlan {
  plan: string | null;
  plan_name: string;
  status: string;
  renewal: string | null;
  features: string[];
  can_upgrade: boolean;
  can_cancel: boolean;
}

// Frontend billing info structure
export interface BillingInfo {
  plan: PlanType;
  plan_name: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  stripeCustomerPortalAvailable: boolean;
  features: string[];
  canUpgrade: boolean;
  canCancel: boolean;
  billingConfigured: boolean;
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
  } = useQuery<BillingStatusResponse | undefined>({
    queryKey: ['billing-status'],
    queryFn: async () => {
      // Try new endpoint first, fall back to legacy
      try {
        const result = await apiFetch<BillingStatusResponse>('/billing/status');
        return result;
      } catch {
        // Fallback to legacy endpoint
        const legacyResult = await apiFetch<BillingPlan>('/billing/me');
        if (legacyResult) {
          return {
            plan: (legacyResult.plan || 'free') as PlanType,
            status: (legacyResult.status || 'none') as SubscriptionStatus,
            current_period_start: null,
            current_period_end: legacyResult.renewal,
            trial_end: null,
            stripe_customer_portal_available: legacyResult.status !== 'none',
            features: legacyResult.features || [],
            can_upgrade: legacyResult.can_upgrade ?? true,
            can_cancel: legacyResult.can_cancel ?? false,
            billing_configured: true,
          };
        }
        return undefined;
      }
    },
    retry: false,
  });

  // Map backend response to frontend BillingInfo structure
  const billing: BillingInfo | null = data
    ? {
        plan: data.plan,
        plan_name: getPlanDisplayName(data.plan),
        status: data.status,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        trialEnd: data.trial_end,
        stripeCustomerPortalAvailable: data.stripe_customer_portal_available,
        features: data.features || [],
        canUpgrade: data.can_upgrade ?? true,
        canCancel: data.can_cancel ?? false,
        billingConfigured: data.billing_configured ?? true,
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

// Helper to get display name for plan
function getPlanDisplayName(plan: string): string {
  const names: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    agency: 'Agency',
    enterprise: 'Enterprise',
  };
  return names[plan.toLowerCase()] ?? plan;
}
