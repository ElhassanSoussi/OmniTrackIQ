"use client";

import { useState } from "react";
import { CampaignsTable, DashboardSection, DateRangeToggle, DateRangeValue } from "@/components/dashboard";
import { CampaignRow } from "@/components/dashboard/campaigns-table";
import { useCampaigns } from "@/hooks/useCampaigns";
import { getDateRange } from "@/lib/date-range";
import { formatCurrency } from "@/lib/format";

export default function CampaignsPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const { from, to } = getDateRange(range);
  const { data, isError, error, isLoading } = useCampaigns(from, to);

  const campaigns: CampaignRow[] =
    data && Array.isArray(data) && data.length
      ? data.map((c: any) => {
          const spend = formatCurrency(c.spend);
          const roas = c.roas ? `${Number(c.roas).toFixed(1)}x` : c.revenue && c.spend ? `${(Number(c.revenue) / Number(c.spend || 1)).toFixed(1)}x` : "—";
          return {
            name: c.campaign_name || c.name || "Untitled campaign",
            platform: c.platform || "unknown",
            spend,
            roas,
            clicks: c.clicks || 0,
            conversions: c.conversions || 0,
          };
        })
      : [
          { name: "FB - Prospecting", platform: "facebook", spend: "$12,400", clicks: 23000, conversions: 1200, roas: "3.2x" },
          { name: "FB - Retargeting", platform: "facebook", spend: "$4,200", clicks: 8500, conversions: 520, roas: "2.6x" },
          { name: "Google - Brand", platform: "google_ads", spend: "$9,500", clicks: 18000, conversions: 980, roas: "4.3x" },
          { name: "Google - Nonbrand", platform: "google_ads", spend: "$3,800", clicks: 9600, conversions: 340, roas: "2.1x" },
          { name: "TikTok - Spark Ads", platform: "tiktok", spend: "$4,800", clicks: 9500, conversions: 410, roas: "2.9x" },
        ];

  return (
    <DashboardSection
      title="Campaign performance"
      description="Normalized spend, conversions, and ROAS across every channel."
      actions={<DateRangeToggle value={range} onChange={setRange} />}
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
          Loading campaigns...
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load campaigns: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}
      {!isLoading && !isError && <CampaignsTable campaigns={campaigns} />}
    </DashboardSection>
  );
}
