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

// Mobile card view for a single campaign
function CampaignCard({ row }: { row: CampaignRow }) {
  return (
    <div className="border-b border-gray-100 p-4 last:border-b-0 dark:border-gray-800">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 dark:text-white truncate">{row.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{row.platform.replace("_", " ")}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold text-emerald-600 dark:text-emerald-400">{row.roas || "—"}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">ROAS</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{row.spend}</div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400">Spend</div>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{row.clicks.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400">Clicks</div>
        </div>
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{row.conversions.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400">Conv.</div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsTable({ campaigns = fallbackCampaigns }: { campaigns?: CampaignRow[] }) {
  const hasRows = campaigns.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 sm:px-5 py-3 sm:py-4 dark:border-gray-800">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Campaigns</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{hasRows ? `${campaigns.length} shown` : "No data"}</span>
      </div>
      {hasRows ? (
        <>
          {/* Mobile card view */}
          <div className="md:hidden">
            {campaigns.map((row) => (
              <CampaignCard key={row.name} row={row} />
            ))}
          </div>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3">Platform</th>
                  <th className="px-5 py-3">Spend</th>
                  <th className="px-5 py-3">ROAS</th>
                  <th className="px-5 py-3">Clicks</th>
                  <th className="px-5 py-3">Conv.</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                {campaigns.map((row) => (
                  <tr key={row.name} className="border-t border-gray-50 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{row.name}</td>
                    <td className="px-5 py-3 capitalize">{row.platform.replace("_", " ")}</td>
                    <td className="px-5 py-3">{row.spend}</td>
                    <td className="px-5 py-3 font-medium text-emerald-600 dark:text-emerald-400">{row.roas || "—"}</td>
                    <td className="px-5 py-3">{row.clicks.toLocaleString()}</td>
                    <td className="px-5 py-3">{row.conversions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No campaigns yet.</div>
      )}
    </div>
  );
}
