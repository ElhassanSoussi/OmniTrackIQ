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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-inner shadow-black/20">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-100">
        <span>Campaigns</span>
        <span className="text-xs text-slate-500">{hasRows ? `${campaigns.length} shown` : "No data"}</span>
      </div>
      {hasRows ? (
        <table className="w-full text-sm text-slate-200">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Spend</th>
              <th className="px-4 py-3">ROAS</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Conversions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((row) => (
              <tr key={row.name} className="border-t border-slate-800">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3 capitalize">{row.platform.replace("_", " ")}</td>
                <td className="px-4 py-3">{row.spend}</td>
                <td className="px-4 py-3">{row.roas || "—"}</td>
                <td className="px-4 py-3">{row.clicks}</td>
                <td className="px-4 py-3">{row.conversions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="px-4 py-8 text-sm text-slate-400">No campaigns yet.</div>
      )}
    </div>
  );
}
