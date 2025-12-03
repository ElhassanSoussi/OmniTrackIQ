import OrdersTable from "@/components/dashboard/orders-table";

export default function OrdersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Orders</h1>
      <OrdersTable />
    </div>
  );
}
