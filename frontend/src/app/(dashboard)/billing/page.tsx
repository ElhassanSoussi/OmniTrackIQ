"use client";

import { useBilling } from "@/hooks/useBilling";

export default function BillingPage() {
  const { plan, isLoading, isError, error, createCheckout, openPortal } = useBilling();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Billing</h1>
      {isLoading ? (
        <div className="text-slate-400">Loading...</div>
      ) : isError ? (
        <div className="rounded-lg border border-rose-800/50 bg-rose-900/30 px-4 py-3 text-sm text-rose-200">
          Failed to load billing status: {error?.message || "Unknown error"}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-sm text-slate-300">Current plan</div>
          <div className="text-xl font-semibold text-white">{plan?.plan || "none"}</div>
          <div className="text-sm text-slate-400">Status: {plan?.status || "none"}</div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => createCheckout("pro")}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
            >
              Upgrade to Pro
            </button>
            <button
              onClick={() => createCheckout("starter")}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500 transition"
            >
              Choose Starter
            </button>
            <button
              onClick={() => openPortal()}
              className="rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-200 hover:border-emerald-400 transition"
            >
              Manage subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
