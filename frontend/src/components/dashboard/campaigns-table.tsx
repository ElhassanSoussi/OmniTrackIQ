export type CampaignRow = {
  name: string;
  platform: string;
  spend: string;
  clicks: number;
  conversions: number;
  roas?: string;
};

const fallbackCampaigns: CampaignRow[] = [
  { name: "FB - Prospecting", platform: "facebook", spend: "$1,200", clicks: 2300, conversions: 120, roas: "3.4x" },
  { name: "Google - Brand", platform: "google_ads", spend: "$950", clicks: 1800, conversions: 98, roas: "4.1x" },
];

export default function CampaignsTable({ campaigns = fallbackCampaigns }: { campaigns?: CampaignRow[] }) {
  const hasRows = campaigns.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <span className="text-sm font-semibold text-gray-900">Campaigns</span>
        <span className="text-xs text-gray-500">{hasRows ? `${campaigns.length} shown` : "No data"}</span>
      </div>
      {hasRows ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Platform</th>
                <th className="px-5 py-3">Spend</th>
                <th className="px-5 py-3">ROAS</th>
                <th className="px-5 py-3">Clicks</th>
                <th className="px-5 py-3">Conv.</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {campaigns.map((row) => (
                <tr key={row.name} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{row.name}</td>
                  <td className="px-5 py-3 capitalize">{row.platform.replace("_", " ")}</td>
                  <td className="px-5 py-3">{row.spend}</td>
                  <td className="px-5 py-3 font-medium text-emerald-600">{row.roas || "—"}</td>
                  <td className="px-5 py-3">{row.clicks.toLocaleString()}</td>
                  <td className="px-5 py-3">{row.conversions.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-8 text-center text-sm text-gray-500">No campaigns yet.</div>
      )}
    </div>
  );
}
