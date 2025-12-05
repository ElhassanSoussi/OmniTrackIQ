"use client";

import { useState } from "react";
import { DashboardSection, DateRangeToggle, DateRangeValue, OrdersTable } from "@/components/dashboard";
import { OrderRow } from "@/components/dashboard/orders-table";
import { useOrders } from "@/hooks/useOrders";
import { getDateRange } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";

export default function OrdersPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const { from, to } = getDateRange(range);
  const { data, isLoading, isError, error } = useOrders(from, to);

  const orders: OrderRow[] =
    data && ((Array.isArray(data) && data.length) || (data as any).items || (data as any).orders || (data as any).results)
      ? (Array.isArray(data)
          ? Array.isArray(data[1])
            ? data[1]
            : data
          : (data as any).items || (data as any).orders || (data as any).results || []
        ).map((o: any) => {
          const amount = formatCurrency(o.total_amount ?? o.amount, o.currency || "USD");
          const id = o.external_order_id || o.id || "—";
          const date = o.date_time ? new Date(o.date_time).toLocaleString() : o.date || "";
          return {
            id,
            date,
            amount,
            source: o.source_platform || o.source || "unknown",
            utm_source: o.utm_source || o.utmSource,
            utm_campaign: o.utm_campaign || o.utmCampaign,
          };
        })
      : [
          { id: "13621", date: "2025-01-02 10:12", amount: "$248.00", source: "shopify", utm_source: "google", utm_campaign: "brand" },
          { id: "13620", date: "2025-01-02 09:55", amount: "$126.00", source: "shopify", utm_source: "fb", utm_campaign: "prospecting" },
          { id: "13619", date: "2025-01-02 09:22", amount: "$188.00", source: "shopify", utm_source: "tiktok", utm_campaign: "spark" },
          { id: "13618", date: "2025-01-02 09:01", amount: "$92.00", source: "shopify", utm_source: "google", utm_campaign: "brand" },
          { id: "13617", date: "2025-01-02 08:44", amount: "$142.00", source: "shopify", utm_source: "fb", utm_campaign: "retargeting" },
        ];

  return (
    <DashboardSection
      title="Orders"
      description="Recent orders with UTM context so you can trace attribution quickly."
      actions={<DateRangeToggle value={range} onChange={setRange} />}
    >
      {isLoading && <div className="text-slate-400">Loading...</div>}
      {isError && <div className="text-sm text-rose-400">Failed to load orders: {error instanceof Error ? error.message : "Unknown error"}</div>}
      {!isLoading && !isError && <OrdersTable orders={orders} />}
    </DashboardSection>
  );
}
