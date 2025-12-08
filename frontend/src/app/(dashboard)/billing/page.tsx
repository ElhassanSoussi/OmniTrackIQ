"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useBilling } from "@/hooks/useBilling";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    features: [
      "1 team member",
      "2 integrations",
      "30-day data retention",
      "Basic dashboard",
    ],
    cta: "Current Plan",
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 49,
    period: "/month",
    features: [
      "3 team members",
      "5 integrations",
      "90-day data retention",
      "Email reports",
      "Email support",
    ],
    cta: "Upgrade",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    period: "/month",
    features: [
      "10 team members",
      "15 integrations",
      "1-year data retention",
      "Custom reports",
      "API access",
      "Priority support",
    ],
    cta: "Upgrade",
    highlighted: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: 399,
    period: "/month",
    features: [
      "Unlimited team members",
      "Unlimited integrations",
      "Unlimited data retention",
      "White-label reports",
      "Dedicated support",
      "Custom onboarding",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { billing, loading, error, createCheckout, openPortal, reload } = useBilling();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Handle checkout success/cancel from URL params
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      setNotification({ type: "success", message: "Subscription activated successfully!" });
      reload();
      // Clear URL params
      window.history.replaceState({}, "", "/billing");
    } else if (status === "cancelled") {
      setNotification({ type: "error", message: "Checkout was cancelled." });
      window.history.replaceState({}, "", "/billing");
    }
  }, [searchParams, reload]);

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return;
    if (planId === "agency") {
      window.location.href = "/contact?reason=agency";
      return;
    }
    
    setUpgrading(planId);
    try {
      await createCheckout(planId);
    } catch (err) {
      setNotification({ 
        type: "error", 
        message: err instanceof Error ? err.message : "Failed to start checkout" 
      });
      setUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      await openPortal();
    } catch (err) {
      setNotification({ 
        type: "error", 
        message: err instanceof Error ? err.message : "Failed to open billing portal" 
      });
    }
  };

  const currentPlan = billing?.plan || "free";
  const isPlanActive = (planId: string) => currentPlan === planId && billing?.status === "active";

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="grid gap-6 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="mt-1 text-gray-500">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {notification.message}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Current Plan Status */}
      {billing && billing.status !== "none" && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Current Plan: {billing.plan_name || currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    billing.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : billing.status === "canceling"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {billing.status === "canceling" ? "Canceling" : billing.status}
                </span>
              </div>
              {billing.renewal && (
                <p className="mt-1 text-sm text-gray-500">
                  {billing.status === "canceling" ? "Access until" : "Next billing date"}:{" "}
                  {new Date(billing.renewal).toLocaleDateString()}
                </p>
              )}
            </div>
            {currentPlan !== "free" && (
              <button
                onClick={handleManageBilling}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Manage Billing
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="grid gap-6 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrentPlan = isPlanActive(plan.id);
          const canUpgrade = !isCurrentPlan && plan.id !== "free";
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border bg-white p-6 shadow-sm transition ${
                plan.highlighted
                  ? "border-emerald-500 ring-2 ring-emerald-500"
                  : isCurrentPlan
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
              </div>

              <ul className="mb-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => canUpgrade && handleUpgrade(plan.id)}
                disabled={isCurrentPlan || upgrading === plan.id || plan.id === "free"}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  isCurrentPlan
                    ? "cursor-default bg-emerald-100 text-emerald-700"
                    : plan.id === "free"
                    ? "cursor-default bg-gray-100 text-gray-400"
                    : plan.highlighted
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                }`}
              >
                {upgrading === plan.id
                  ? "Redirecting..."
                  : isCurrentPlan
                  ? "Current Plan"
                  : plan.id === "free"
                  ? "Free Forever"
                  : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ / Help */}
      <div className="mt-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-gray-900">Can I change plans anytime?</h4>
            <p className="mt-1 text-sm text-gray-500">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">What happens when I cancel?</h4>
            <p className="mt-1 text-sm text-gray-500">
              Your subscription remains active until the end of your billing period. Your data is retained for 30 days.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Do you offer refunds?</h4>
            <p className="mt-1 text-sm text-gray-500">
              We offer a 14-day money-back guarantee. Contact support within 14 days for a full refund.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Need help choosing?</h4>
            <p className="mt-1 text-sm text-gray-500">
              <a href="/contact" className="text-emerald-600 hover:text-emerald-700">
                Contact our sales team
              </a>{" "}
              for personalized recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
