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
  facebook: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  google_ads: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  tiktok: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  shopify: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  snapchat: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  pinterest: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  linkedin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function ChannelTable({ channels, isLoading }: ChannelTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark">
        <div className="flex items-center justify-between border-b border-gh-border px-5 py-3 dark:border-gh-border-dark">
          <span className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Channel Performance</span>
        </div>
        <div className="animate-pulse p-5">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-md bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasRows = channels && channels.length > 0;

  return (
    <div className="rounded-md border border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark transition-colors">
      <div className="flex items-center justify-between border-b border-gh-border px-5 py-3 dark:border-gh-border-dark">
        <span className="text-sm font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Channel Performance</span>
        <span className="text-xs text-gh-text-secondary dark:text-gh-text-secondary-dark">
          {hasRows ? `${channels.length} channels` : "No data"}
        </span>
      </div>
      {hasRows ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gh-border text-left text-xs font-medium uppercase tracking-wide text-gh-text-tertiary dark:border-gh-border-dark dark:text-gh-text-tertiary-dark">
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
            <tbody className="text-gh-text-secondary dark:text-gh-text-secondary-dark">
              {channels.map((row) => {
                const colorClass = PLATFORM_COLORS[row.platform] || "bg-gh-canvas-subtle text-gh-text-secondary dark:bg-gh-canvas-subtle-dark dark:text-gh-text-secondary-dark";
                const roasColor = row.roas >= 3 ? "text-brand-600 dark:text-brand-400" : row.roas >= 2 ? "text-gh-attention-fg dark:text-gh-attention-fg-dark" : "text-gh-danger dark:text-gh-danger-dark";
                
                return (
                  <tr key={row.platform} className="border-t border-gh-border hover:bg-gh-canvas-subtle dark:border-gh-border-dark dark:hover:bg-gh-canvas-subtle-dark">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
                        {row.platform_label || row.platform}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium">{formatCurrency(row.spend)}</td>
                    <td className="px-5 py-3 font-medium text-brand-600 dark:text-brand-400">{formatCurrency(row.revenue)}</td>
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
        <div className="px-5 py-8 text-center text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">
          No channel data available. Connect your ad platforms to see performance by channel.
        </div>
      )}
    </div>
  );
}
