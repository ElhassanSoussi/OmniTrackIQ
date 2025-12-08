"use client";

import { useState } from "react";
import { DashboardSection, DateRangeToggle, DateRangeValue, OrdersTable } from "@/components/dashboard";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderRow } from "@/components/dashboard/orders-table";
import { OrderRecord, OrdersResponse, useOrders } from "@/hooks/useOrders";
import { useSampleDataStats, useGenerateSampleData } from "@/hooks/useSampleData";
import { getDateRange } from "@/lib/date-range";
import { formatCurrency, formatErrorMessage } from "@/lib/format";

export default function OrdersPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const { from, to } = getDateRange(range);
  const { data, isLoading, isError, error } = useOrders(from, to);
  const { data: sampleDataStats } = useSampleDataStats();
  const generateSampleData = useGenerateSampleData();

  const rawOrders = data
    ? ((Array.isArray(data)
        ? Array.isArray((data as any)[1])
          ? (data as any)[1]
          : data
        : (data as any).items || (data as any).orders || (data as any).results || []) as OrderRecord[])
    : [];

  const orders: OrderRow[] = rawOrders.map((o: OrderRecord) => {
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
  });

  const hasNoOrders = !isLoading && !isError && orders.length === 0;

  return (
    <DashboardSection
      title="Orders"
      description="Recent orders with UTM context so you can trace attribution quickly."
      actions={<DateRangeToggle value={range} onChange={setRange} />}
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
          Loading orders...
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load orders: {formatErrorMessage(error)}
        </div>
      )}
      {!isLoading && !isError && !hasNoOrders && <OrdersTable orders={orders} />}
      {hasNoOrders && (
        <EmptyState
          icon="orders"
          title="No orders yet"
          description="Connect Shopify to stream orders automatically, or generate sample data to explore the platform."
          actionLabel="Connect Shopify"
          actionHref="/integrations/shopify"
          secondaryActionLabel={!sampleDataStats?.has_sample_data ? "Generate Sample Data" : undefined}
          onAction={!sampleDataStats?.has_sample_data ? () => generateSampleData.mutate() : undefined}
        />
      )}
    </DashboardSection>
  );
}
