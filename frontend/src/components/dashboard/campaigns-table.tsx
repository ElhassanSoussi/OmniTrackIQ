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
    <div className="border-b border-gh-border p-4 last:border-b-0 dark:border-gh-border-dark">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gh-text-primary dark:text-gh-text-primary-dark truncate">{row.name}</div>
          <div className="text-xs text-gh-text-secondary dark:text-gh-text-secondary-dark capitalize mt-0.5">{row.platform.replace("_", " ")}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold text-brand-600 dark:text-brand-400">{row.roas || "—"}</div>
          <div className="text-xs text-gh-text-tertiary dark:text-gh-text-tertiary-dark">ROAS</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark p-2">
          <div className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">{row.spend}</div>
          <div className="text-[10px] text-gh-text-tertiary dark:text-gh-text-tertiary-dark">Spend</div>
        </div>
        <div className="rounded-md bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark p-2">
          <div className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">{row.clicks.toLocaleString()}</div>
          <div className="text-[10px] text-gh-text-tertiary dark:text-gh-text-tertiary-dark">Clicks</div>
        </div>
        <div className="rounded-md bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark p-2">
          <div className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">{row.conversions.toLocaleString()}</div>
          <div className="text-[10px] text-gh-text-tertiary dark:text-gh-text-tertiary-dark">Conv.</div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsTable({ campaigns = fallbackCampaigns }: { campaigns?: CampaignRow[] }) {
  const hasRows = campaigns.length > 0;

  return (
    <div className="rounded-md border border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark transition-colors">
      <div className="flex items-center justify-between border-b border-gh-border px-4 sm:px-5 py-3 dark:border-gh-border-dark">
        <span className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Campaigns</span>
        <span className="text-xs text-gh-text-secondary dark:text-gh-text-secondary-dark">{hasRows ? `${campaigns.length} shown` : "No data"}</span>
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
              <thead className="border-b border-gh-border text-left text-xs font-medium uppercase tracking-wide text-gh-text-tertiary dark:border-gh-border-dark dark:text-gh-text-tertiary-dark">
                <tr>
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3">Platform</th>
                  <th className="px-5 py-3">Spend</th>
                  <th className="px-5 py-3">ROAS</th>
                  <th className="px-5 py-3">Clicks</th>
                  <th className="px-5 py-3">Conv.</th>
                </tr>
              </thead>
              <tbody className="text-gh-text-secondary dark:text-gh-text-secondary-dark">
                {campaigns.map((row) => (
                  <tr key={row.name} className="border-t border-gh-border hover:bg-gh-canvas-subtle dark:border-gh-border-dark dark:hover:bg-gh-canvas-subtle-dark">
                    <td className="px-5 py-3 font-medium text-gh-text-primary dark:text-gh-text-primary-dark">{row.name}</td>
                    <td className="px-5 py-3 capitalize">{row.platform.replace("_", " ")}</td>
                    <td className="px-5 py-3">{row.spend}</td>
                    <td className="px-5 py-3 font-medium text-brand-600 dark:text-brand-400">{row.roas || "—"}</td>
                    <td className="px-5 py-3">{row.clicks.toLocaleString()}</td>
                    <td className="px-5 py-3">{row.conversions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-5 py-8 text-center text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">No campaigns yet.</div>
      )}
    </div>
  );
}
