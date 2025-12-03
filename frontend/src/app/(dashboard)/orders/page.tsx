import OrdersTable from "@/components/dashboard/orders-table";
import { getDefaultDateRange } from "@/lib/date-range";

export default function OrdersPage() {
  const { from, to } = getDefaultDateRange();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Orders</h1>
      <OrdersTable from={from} to={to} />
    </div>
  );
}
