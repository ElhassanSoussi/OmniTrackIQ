"use client";

import { useBilling } from "@/hooks/useBilling";

export default function BillingPage() {
  const { billing, loading, error } = useBilling();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
        Loading billing info...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Error: {error}
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="text-gray-500">No billing information found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500">Manage your subscription and payment details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Plan Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium ${billing.status === "active" ? "text-emerald-600" : "text-gray-900"}`}>
                {billing.status ?? "Unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Plan</span>
              <span className="font-medium text-gray-900">
                {billing.plan ?? "Free"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Next payment</span>
              <span className="font-medium text-gray-900">
                {billing.nextPaymentDate ?? "N/A"}
              </span>
            </div>
          </div>
          <button className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Upgrade Plan
          </button>
        </div>

        {/* Payment Method Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex h-10 w-14 items-center justify-center rounded bg-gray-200 text-xs font-bold text-gray-600">
              VISA
            </div>
            <div>
              <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
              <div className="text-sm text-gray-500">Expires 12/25</div>
            </div>
          </div>
          <button className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            Update payment method
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
        </div>
        <div className="px-6 py-8 text-center text-sm text-gray-500">
          No billing history yet.
        </div>
      </div>
    </div>
  );
}
