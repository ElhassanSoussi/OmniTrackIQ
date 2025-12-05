"use client";

import { useBilling } from "@/hooks/useBilling";

export default function BillingPage() {
  const { billing, loading, error } = useBilling();

  if (loading) {
    return <div className="text-white">Loading billing info...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!billing) {
    return <div className="text-gray-400">No billing information found.</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Billing</h1>

      <div className="bg-[#0d0f1a] rounded-xl p-4 shadow-md">
        <div className="flex justify-between">
          <span className="text-gray-400">Subscription Status:</span>
          <span className="text-white font-semibold">
            {billing.status ?? "Unknown"}
          </span>
        </div>

        <div className="flex justify-between mt-3">
          <span className="text-gray-400">Current Plan:</span>
          <span className="text-white font-semibold">
            {billing.plan ?? "Free"}
          </span>
        </div>

        <div className="flex justify-between mt-3">
          <span className="text-gray-400">Renewal Date:</span>
          <span className="text-white font-semibold">
            {billing.nextPaymentDate ?? "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
