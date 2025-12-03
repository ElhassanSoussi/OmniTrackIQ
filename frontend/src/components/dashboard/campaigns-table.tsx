"use client";

import { useCampaigns } from "@/hooks/useCampaigns";
import { formatCurrency, formatNumber } from "@/lib/formatters";

interface CampaignsTableProps {
  from: string;
  to: string;
}

export default function CampaignsTable({ from, to }: CampaignsTableProps) {
  const { data, isLoading, isError, error } = useCampaigns(from, to);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70">
      <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-slate-100">Campaigns</div>

      {isLoading && <div className="px-4 py-6 text-sm text-slate-400">Loading campaigns...</div>}
      {isError && <div className="px-4 py-6 text-sm text-rose-400">{error instanceof Error ? error.message : "Failed to load campaigns."}</div>}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="px-4 py-6 text-sm text-slate-400">No campaign data available for this range.</div>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
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
            {data.map((row) => (
              <tr key={`${row.platform}-${row.campaign_id}`} className="border-t border-slate-800">
                <td className="px-4 py-3">{row.campaign_name || row.campaign_id || "Unknown"}</td>
                <td className="px-4 py-3 capitalize">{row.platform?.replace("_", " ") || ""}</td>
                <td className="px-4 py-3">{formatCurrency(row.spend)}</td>
                <td className="px-4 py-3">{formatNumber(row.clicks)}</td>
                <td className="px-4 py-3">{formatNumber(row.conversions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
