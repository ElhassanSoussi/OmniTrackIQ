"use client";

import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/formatters";

interface OrdersTableProps {
  from: string;
  to: string;
  limit?: number;
}

export default function OrdersTable({ from, to, limit = 20 }: OrdersTableProps) {
  const { data, isLoading, isError, error } = useOrders(from, to, limit);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70">
      <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-100">Recent Orders</div>

      {isLoading && <div className="px-4 py-6 text-sm text-slate-400">Loading orders...</div>}
      {isError && <div className="px-4 py-6 text-sm text-rose-400">{error instanceof Error ? error.message : "Failed to load orders."}</div>}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <div className="px-4 py-6 text-sm text-slate-400">No orders available for this range.</div>
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <table className="w-full text-sm text-slate-200">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">UTM Source</th>
              <th className="px-4 py-3">UTM Campaign</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((order) => (
              <tr key={order.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                <td className="px-4 py-3">{new Date(order.date_time).toLocaleString()}</td>
                <td className="px-4 py-3">{formatCurrency(order.total_amount)}</td>
                <td className="px-4 py-3 capitalize">{order.source_platform}</td>
                <td className="px-4 py-3">{order.utm_source || "-"}</td>
                <td className="px-4 py-3">{order.utm_campaign || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
