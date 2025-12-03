const rows = [
  { name: "FB - Prospecting", platform: "facebook", spend: "$1,200", clicks: 2300, conversions: 120 },
  { name: "Google - Brand", platform: "google_ads", spend: "$950", clicks: 1800, conversions: 98 },
];

export default function CampaignsTable() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70">
      <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-100">Campaigns</div>
      <table className="w-full text-sm text-slate-200">
        <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Campaign</th>
            <th className="px-4 py-3">Platform</th>
            <th className="px-4 py-3">Spend</th>
            <th className="px-4 py-3">Clicks</th>
            <th className="px-4 py-3">Conversions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-slate-800">
              <td className="px-4 py-3">{row.name}</td>
              <td className="px-4 py-3 capitalize">{row.platform.replace("_", " ")}</td>
              <td className="px-4 py-3">{row.spend}</td>
              <td className="px-4 py-3">{row.clicks}</td>
              <td className="px-4 py-3">{row.conversions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
