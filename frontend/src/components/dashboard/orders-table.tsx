export type OrderRow = {
  id: string;
  date_time: string;
  amount: number | string;
  currency?: string;
  source?: string;
  date: string;
  amount: string;
  source: string;
  utm_source?: string;
  utm_campaign?: string;
};

const fallbackOrders: OrderRow[] = [
  {
    id: "1001",
    date_time: "2025-01-01T10:30:00Z",
    amount: 240,
    currency: "USD",
    source: "shopify",
    utm_source: "fb",
    utm_campaign: "prospecting",
  },
  {
    id: "1002",
    date_time: "2025-01-01T11:05:00Z",
    amount: 120,
    currency: "USD",
    source: "shopify",
    utm_source: "google",
    utm_campaign: "brand",
  },
];

function formatAmount(amount: number | string, currency = "USD") {
  if (typeof amount === "number") {
    return amount.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
  }
  if (typeof amount === "string") {
    const parsed = parseFloat(amount.replace(/,/g, ""));
    if (!isNaN(parsed)) {
      return parsed.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
    }
    return amount;
  }
  return amount;
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function OrdersTable({ orders = fallbackOrders, loading = false }: { orders?: OrderRow[]; loading?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70">
      <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-100">Recent Orders</div>

      {loading ? (
        <div className="px-4 py-6 text-sm text-slate-400">Loading orders…</div>
      ) : orders && orders.length > 0 ? (
  { id: "1001", date: "2025-01-01 10:30", amount: "$240.00", source: "shopify", utm_source: "fb", utm_campaign: "prospecting" },
  { id: "1002", date: "2025-01-01 11:05", amount: "$120.00", source: "shopify", utm_source: "google", utm_campaign: "brand" },
  { id: "1003", date: "2025-01-01 11:42", amount: "$180.00", source: "shopify", utm_source: "tiktok", utm_campaign: "retargeting" },
];

export default function OrdersTable({ orders = fallbackOrders }: { orders?: OrderRow[] }) {
  const hasRows = orders.length > 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-inner shadow-black/20">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-100">
        <span>Recent Orders</span>
        <span className="text-xs text-slate-500">{hasRows ? `${orders.length} shown` : "No data"}</span>
      </div>
      {hasRows ? (
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
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-slate-800">
                <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                <td className="px-4 py-3">{formatDateTime(order.date_time)}</td>
                <td className="px-4 py-3">{formatAmount(order.amount, order.currency)}</td>
                <td className="px-4 py-3">{order.source || "—"}</td>
                <td className="px-4 py-3">{order.date}</td>
                <td className="px-4 py-3">{order.amount}</td>
                <td className="px-4 py-3 capitalize">{order.source.replace("_", " ")}</td>
                <td className="px-4 py-3">{order.utm_source || "—"}</td>
                <td className="px-4 py-3">{order.utm_campaign || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="px-4 py-6 text-sm text-slate-400">No orders found for this range yet.</div>
        <div className="px-4 py-8 text-sm text-slate-400">No orders yet.</div>
      )}
    </div>
  );
}
