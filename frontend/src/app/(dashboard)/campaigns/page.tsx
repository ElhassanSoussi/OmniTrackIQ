import CampaignsTable from "@/components/dashboard/campaigns-table";
import { getDefaultDateRange } from "@/lib/date-range";

export default function CampaignsPage() {
  const { from, to } = getDefaultDateRange();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Campaign Performance</h1>
      <CampaignsTable from={from} to={to} />
    </div>
  );
}
