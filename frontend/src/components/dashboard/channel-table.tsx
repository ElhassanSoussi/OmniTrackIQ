import { formatCurrency, formatNumber } from "@/lib/format";
import { MetricTooltip } from "@/components/ui/metric-tooltip";

export interface ChannelRow {
  platform: string;
  platform_label: string;
  spend: number;
  revenue: number;
  roas: number;
  orders: number;
  cpc: number;
}

interface ChannelTableProps {
  channels?: ChannelRow[];
  isLoading?: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-700",
  google_ads: "bg-red-100 text-red-700",
  tiktok: "bg-gray-100 text-gray-700",
  shopify: "bg-green-100 text-green-700",
  snapchat: "bg-yellow-100 text-yellow-700",
  pinterest: "bg-red-100 text-red-600",
  linkedin: "bg-blue-100 text-blue-800",
};

export default function ChannelTable({ channels, isLoading }: ChannelTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <span className="text-sm font-semibold text-gray-900">Channel Performance</span>
        </div>
        <div className="animate-pulse p-5">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasRows = channels && channels.length > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <span className="text-sm font-semibold text-gray-900">Channel Performance</span>
        <span className="text-xs text-gray-500">
          {hasRows ? `${channels.length} channels` : "No data"}
        </span>
      </div>
      {hasRows ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Channel</th>
                <th className="px-5 py-3">
                  <MetricTooltip metric="spend">Spend</MetricTooltip>
                </th>
                <th className="px-5 py-3">
                  <MetricTooltip metric="revenue">Revenue</MetricTooltip>
                </th>
                <th className="px-5 py-3">
                  <MetricTooltip metric="roas">ROAS</MetricTooltip>
                </th>
                <th className="px-5 py-3">
                  <MetricTooltip metric="orders">Orders</MetricTooltip>
                </th>
                <th className="px-5 py-3">
                  <MetricTooltip metric="cpc">CPC</MetricTooltip>
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {channels.map((row) => {
                const colorClass = PLATFORM_COLORS[row.platform] || "bg-gray-100 text-gray-700";
                const roasColor = row.roas >= 3 ? "text-emerald-600" : row.roas >= 2 ? "text-yellow-600" : "text-red-600";
                
                return (
                  <tr key={row.platform} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
                        {row.platform_label || row.platform}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium">{formatCurrency(row.spend)}</td>
                    <td className="px-5 py-3 font-medium text-emerald-600">{formatCurrency(row.revenue)}</td>
                    <td className={`px-5 py-3 font-semibold ${roasColor}`}>
                      {row.roas.toFixed(2)}x
                    </td>
                    <td className="px-5 py-3">{formatNumber(row.orders)}</td>
                    <td className="px-5 py-3">{formatCurrency(row.cpc)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-8 text-center text-sm text-gray-500">
          No channel data available. Connect your ad platforms to see performance by channel.
        </div>
      )}
    </div>
  );
}
