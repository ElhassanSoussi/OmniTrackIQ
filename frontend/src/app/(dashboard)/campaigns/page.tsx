import CampaignsTable from "@/components/dashboard/campaigns-table";

export default function CampaignsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Campaign Performance</h1>
      <CampaignsTable />
    </div>
  );
}
