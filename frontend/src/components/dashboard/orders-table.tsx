const orders = [
  { id: "1001", date: "2025-01-01 10:30", amount: "$240.00", source: "shopify", utm_source: "fb", utm_campaign: "prospecting" },
  { id: "1002", date: "2025-01-01 11:05", amount: "$120.00", source: "shopify", utm_source: "google", utm_campaign: "brand" },
];

export default function OrdersTable() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70">
      <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-100">Recent Orders</div>
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
              <td className="px-4 py-3">{order.date}</td>
              <td className="px-4 py-3">{order.amount}</td>
              <td className="px-4 py-3">{order.source}</td>
              <td className="px-4 py-3">{order.utm_source}</td>
              <td className="px-4 py-3">{order.utm_campaign}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
