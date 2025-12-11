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

// Mobile card view for a single order
function OrderCard({ order }: { order: OrderRow }) {
  return (
    <div className="border-b border-gh-border p-4 last:border-b-0 dark:border-gh-border-dark">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-xs text-gh-text-tertiary dark:text-gh-text-tertiary-dark">#{order.id}</div>
          <div className="font-semibold text-gh-text-primary dark:text-gh-text-primary-dark mt-0.5">{order.amount}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gh-text-secondary dark:text-gh-text-secondary-dark">{order.date}</div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark px-2 py-0.5 text-xs font-medium text-gh-text-secondary dark:text-gh-text-secondary-dark capitalize">
          {order.source.replace("_", " ")}
        </span>
        {order.utm_source && (
          <span className="inline-flex items-center rounded-full bg-gh-accent-subtle px-2 py-0.5 text-xs font-medium text-gh-accent-fg dark:bg-gh-accent-subtle-dark dark:text-gh-accent-fg-dark">
            {order.utm_source}
          </span>
        )}
        {order.utm_campaign && (
          <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400 truncate max-w-[120px]">
            {order.utm_campaign}
          </span>
        )}
      </div>
    </div>
  );
}

export default function OrdersTable({ orders = fallbackOrders }: { orders?: OrderRow[] }) {
  const hasRows = orders.length > 0;

  return (
    <div className="rounded-md border border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark transition-colors">
      <div className="flex items-center justify-between border-b border-gh-border px-4 sm:px-5 py-3 dark:border-gh-border-dark">
        <span className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Recent Orders</span>
        <span className="text-xs text-gh-text-secondary dark:text-gh-text-secondary-dark">{hasRows ? `${orders.length} shown` : "No data"}</span>
      </div>
      {hasRows ? (
        <>
          {/* Mobile card view */}
          <div className="md:hidden">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gh-border text-left text-xs font-medium uppercase tracking-wide text-gh-text-tertiary dark:border-gh-border-dark dark:text-gh-text-tertiary-dark">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">UTM</th>
                </tr>
              </thead>
              <tbody className="text-gh-text-secondary dark:text-gh-text-secondary-dark">
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-gh-border hover:bg-gh-canvas-subtle dark:border-gh-border-dark dark:hover:bg-gh-canvas-subtle-dark">
                    <td className="px-5 py-3 font-mono text-xs text-gh-text-primary dark:text-gh-text-primary-dark">{order.id}</td>
                    <td className="px-5 py-3 text-gh-text-secondary dark:text-gh-text-secondary-dark">{order.date}</td>
                    <td className="px-5 py-3 font-medium text-gh-text-primary dark:text-gh-text-primary-dark">{order.amount}</td>
                    <td className="px-5 py-3 capitalize">{order.source.replace("_", " ")}</td>
                    <td className="px-5 py-3 text-gh-text-secondary dark:text-gh-text-secondary-dark">{order.utm_source || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-5 py-8 text-center text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">No orders yet.</div>
      )}
    </div>
  );
}
