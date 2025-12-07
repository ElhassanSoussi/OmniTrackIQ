export type OrderRow = {
  id: string;
  date: string;
  amount: string;
  source: string;
  utm_source?: string;
  utm_campaign?: string;
};

const fallbackOrders: OrderRow[] = [
  { id: "1001", date: "2025-01-01 10:30", amount: "$240.00", source: "shopify", utm_source: "fb", utm_campaign: "prospecting" },
  { id: "1002", date: "2025-01-01 11:05", amount: "$120.00", source: "shopify", utm_source: "google", utm_campaign: "brand" },
  { id: "1003", date: "2025-01-01 11:42", amount: "$180.00", source: "shopify", utm_source: "tiktok", utm_campaign: "retargeting" },
];

export default function OrdersTable({ orders = fallbackOrders }: { orders?: OrderRow[] }) {
  const hasRows = orders.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <span className="text-sm font-semibold text-gray-900">Recent Orders</span>
        <span className="text-xs text-gray-500">{hasRows ? `${orders.length} shown` : "No data"}</span>
      </div>
      {hasRows ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">UTM</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-gray-900">{order.id}</td>
                  <td className="px-5 py-3 text-gray-500">{order.date}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">{order.amount}</td>
                  <td className="px-5 py-3 capitalize">{order.source.replace("_", " ")}</td>
                  <td className="px-5 py-3 text-gray-500">{order.utm_source || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-8 text-center text-sm text-gray-500">No orders yet.</div>
      )}
    </div>
  );
}
