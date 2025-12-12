"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, AlertTriangle, Award, Image, Play, Zap, BarChart3 } from "lucide-react";

// Mock creative data - in production this would come from the API
const MOCK_CREATIVES = [
    {
        id: "1",
        name: "Summer Sale - Hero Video",
        type: "video",
        platform: "facebook",
        thumbnail: "/api/placeholder/120/120",
        spend: 12400,
        impressions: 450000,
        clicks: 8900,
        conversions: 234,
        revenue: 18720,
        roas: 1.51,
        ctr: 1.98,
        cvr: 2.63,
        status: "active",
        trend: "up",
        fatigue_score: 15,
    },
    {
        id: "2",
        name: "Product Carousel - New Arrivals",
        type: "carousel",
        platform: "facebook",
        thumbnail: "/api/placeholder/120/120",
        spend: 8500,
        impressions: 320000,
        clicks: 5400,
        conversions: 189,
        revenue: 15120,
        roas: 1.78,
        ctr: 1.69,
        cvr: 3.50,
        status: "active",
        trend: "up",
        fatigue_score: 8,
    },
    {
        id: "3",
        name: "Brand Story - UGC Testimonial",
        type: "video",
        platform: "tiktok",
        thumbnail: "/api/placeholder/120/120",
        spend: 4800,
        impressions: 890000,
        clicks: 12300,
        conversions: 156,
        revenue: 9360,
        roas: 1.95,
        ctr: 1.38,
        cvr: 1.27,
        status: "active",
        trend: "stable",
        fatigue_score: 22,
    },
    {
        id: "4",
        name: "Flash Sale Banner",
        type: "image",
        platform: "google_ads",
        thumbnail: "/api/placeholder/120/120",
        spend: 3200,
        impressions: 180000,
        clicks: 2800,
        conversions: 67,
        revenue: 4690,
        roas: 1.47,
        ctr: 1.56,
        cvr: 2.39,
        status: "paused",
        trend: "down",
        fatigue_score: 78,
    },
    {
        id: "5",
        name: "Limited Edition Collection",
        type: "video",
        platform: "facebook",
        thumbnail: "/api/placeholder/120/120",
        spend: 6700,
        impressions: 290000,
        clicks: 4100,
        conversions: 98,
        revenue: 7840,
        roas: 1.17,
        ctr: 1.41,
        cvr: 2.39,
        status: "active",
        trend: "down",
        fatigue_score: 65,
    },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
}

function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}

function PlatformBadge({ platform }: { platform: string }) {
    const colors: Record<string, string> = {
        facebook: "bg-blue-100 text-blue-700",
        tiktok: "bg-pink-100 text-pink-700",
        google_ads: "bg-yellow-100 text-yellow-700",
        instagram: "bg-purple-100 text-purple-700",
    };
    const labels: Record<string, string> = {
        facebook: "Facebook",
        tiktok: "TikTok",
        google_ads: "Google",
        instagram: "Instagram",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[platform] || "bg-gray-100 text-gray-700"}`}>
            {labels[platform] || platform}
        </span>
    );
}

function FatigueIndicator({ score }: { score: number }) {
    let color = "bg-emerald-500";
    let label = "Fresh";

    if (score >= 60) {
        color = "bg-red-500";
        label = "Fatigued";
    } else if (score >= 30) {
        color = "bg-amber-500";
        label = "Warning";
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 w-16">{label}</span>
        </div>
    );
}

function CreativeCard({ creative }: { creative: typeof MOCK_CREATIVES[0] }) {
    const TrendIcon = creative.trend === "up" ? TrendingUp : creative.trend === "down" ? TrendingDown : BarChart3;
    const trendColor = creative.trend === "up" ? "text-emerald-500" : creative.trend === "down" ? "text-red-500" : "text-slate-400";

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-lg transition-all dark:border-slate-700 dark:bg-slate-800">
            <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    {creative.type === "video" ? (
                        <Play className="h-8 w-8 text-slate-400" />
                    ) : (
                        <Image className="h-8 w-8 text-slate-400" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{creative.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <PlatformBadge platform={creative.platform} />
                                <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{creative.type}</span>
                                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                            </div>
                        </div>
                        {creative.fatigue_score >= 60 && (
                            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        )}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Spend</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(creative.spend)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">ROAS</p>
                            <p className={`font-semibold ${creative.roas >= 1.5 ? "text-emerald-600" : creative.roas >= 1 ? "text-amber-600" : "text-red-600"}`}>
                                {creative.roas.toFixed(2)}x
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">CTR</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{formatPercent(creative.ctr)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">CVR</p>
                            <p className="font-semibold text-slate-900 dark:text-white">{formatPercent(creative.cvr)}</p>
                        </div>
                    </div>

                    {/* Fatigue */}
                    <div className="mt-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Creative Fatigue</p>
                        <FatigueIndicator score={creative.fatigue_score} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CreativeIntelligencePage() {
    const [sortBy, setSortBy] = useState<"roas" | "spend" | "fatigue">("roas");
    const [filterPlatform, setFilterPlatform] = useState<string>("all");

    // Sort and filter creatives
    const sortedCreatives = [...MOCK_CREATIVES]
        .filter((c) => filterPlatform === "all" || c.platform === filterPlatform)
        .sort((a, b) => {
            if (sortBy === "roas") return b.roas - a.roas;
            if (sortBy === "spend") return b.spend - a.spend;
            if (sortBy === "fatigue") return b.fatigue_score - a.fatigue_score;
            return 0;
        });

    // Calculate summary stats
    const totalSpend = MOCK_CREATIVES.reduce((sum, c) => sum + c.spend, 0);
    const totalRevenue = MOCK_CREATIVES.reduce((sum, c) => sum + c.revenue, 0);
    const avgRoas = totalRevenue / totalSpend;
    const fatiguedCount = MOCK_CREATIVES.filter((c) => c.fatigue_score >= 60).length;
    const topPerformer = [...MOCK_CREATIVES].sort((a, b) => b.roas - a.roas)[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap className="h-6 w-6 text-primary-500" />
                        Creative Intelligence
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Analyze your ad creatives. Find winners, detect fatigue, and optimize performance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={filterPlatform}
                        onChange={(e) => setFilterPlatform(e.target.value)}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">All Platforms</option>
                        <option value="facebook">Facebook</option>
                        <option value="tiktok">TikTok</option>
                        <option value="google_ads">Google Ads</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "roas" | "spend" | "fatigue")}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="roas">Sort by ROAS</option>
                        <option value="spend">Sort by Spend</option>
                        <option value="fatigue">Sort by Fatigue</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Spend</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalSpend)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Avg ROAS</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">{avgRoas.toFixed(2)}x</p>
                </div>
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
                    <p className="text-sm text-amber-600 dark:text-amber-400">Fatigued Creatives</p>
                    <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">{fatiguedCount}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
                    <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-emerald-500" />
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">Top Performer</p>
                    </div>
                    <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300 truncate" title={topPerformer.name}>
                        {topPerformer.name}
                    </p>
                </div>
            </div>

            {/* Alerts */}
            {fatiguedCount > 0 && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                                {fatiguedCount} {fatiguedCount === 1 ? "creative is" : "creatives are"} showing fatigue
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                Consider refreshing these creatives or pausing them to avoid wasted spend. Creative fatigue happens when your audience sees the same ad too many times.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Creatives List */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Creatives ({sortedCreatives.length})
                </h2>
                {sortedCreatives.map((creative) => (
                    <CreativeCard key={creative.id} creative={creative} />
                ))}
            </div>

            {/* Pro Tips */}
            <div className="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 p-6">
                <h3 className="font-semibold text-primary-800 dark:text-primary-200 mb-3">🎯 Pro Tips for Creative Optimization</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                        <span className="text-primary-500">•</span>
                        <p className="text-sm text-primary-700 dark:text-primary-300">
                            <strong>Refresh fatigued creatives</strong> before CTR drops below 1%
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-primary-500">•</span>
                        <p className="text-sm text-primary-700 dark:text-primary-300">
                            <strong>Scale winning creatives</strong> with ROAS above 1.5x
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-primary-500">•</span>
                        <p className="text-sm text-primary-700 dark:text-primary-300">
                            <strong>Test new variations</strong> of top performers regularly
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-primary-500">•</span>
                        <p className="text-sm text-primary-700 dark:text-primary-300">
                            <strong>Monitor conversion rate</strong> for creatives with high CTR
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
