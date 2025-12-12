"use client";

import { TrendingUp, TrendingDown, DollarSign, Wallet, PiggyBank, Lightbulb } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface FounderModeProps {
    revenue: number;
    spend: number;
    profit: number;
    topChannel?: {
        name: string;
        roas: number;
    };
    concernChannel?: {
        name: string;
        issue: string;
    };
    revenueTrend?: number;
    spendTrend?: number;
    profitTrend?: number;
}

export function FounderMode({
    revenue,
    spend,
    profit,
    topChannel,
    concernChannel,
    revenueTrend = 0,
    spendTrend = 0,
    profitTrend = 0,
}: FounderModeProps) {
    const TrendIcon = ({ value }: { value: number }) =>
        value >= 0 ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
        ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
        );

    const formatTrend = (value: number) => {
        const sign = value >= 0 ? "+" : "";
        return `${sign}${value.toFixed(0)}%`;
    };

    const getTrendColor = (value: number, inverse = false) => {
        if (inverse) {
            return value <= 0 ? "text-emerald-600" : "text-red-600";
        }
        return value >= 0 ? "text-emerald-600" : "text-red-600";
    };

    // Generate plain-English summary
    const generateSummary = () => {
        const summaries: string[] = [];

        if (profitTrend > 10) {
            summaries.push(`Great news! Your profit is up ${profitTrend.toFixed(0)}% this period.`);
        } else if (profitTrend > 0) {
            summaries.push(`Your profit is growing steadily, up ${profitTrend.toFixed(0)}%.`);
        } else if (profitTrend < -10) {
            summaries.push(`Heads up: Profit is down ${Math.abs(profitTrend).toFixed(0)}%. Let's look at what's happening.`);
        } else if (profitTrend < 0) {
            summaries.push(`Profit is slightly down ${Math.abs(profitTrend).toFixed(0)}% - nothing to panic about.`);
        } else {
            summaries.push("Profit is holding steady compared to last period.");
        }

        return summaries[0];
    };

    return (
        <div className="space-y-6">
            {/* Main Metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
                {/* Revenue */}
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm dark:border-slate-700 dark:from-emerald-950/20 dark:to-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/50">
                            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Revenue</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(revenue)}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                        <TrendIcon value={revenueTrend} />
                        <span className={`text-sm font-medium ${getTrendColor(revenueTrend)}`}>
                            {formatTrend(revenueTrend)} vs last period
                        </span>
                    </div>
                </div>

                {/* Ad Spend */}
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-slate-700 dark:from-blue-950/20 dark:to-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/50">
                            <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Ad Spend</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(spend)}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                        <TrendIcon value={spendTrend} />
                        <span className={`text-sm font-medium ${getTrendColor(spendTrend, true)}`}>
                            {formatTrend(spendTrend)} vs last period
                        </span>
                    </div>
                </div>

                {/* Profit */}
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm dark:border-slate-700 dark:from-purple-950/20 dark:to-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-xl bg-purple-100 p-2.5 dark:bg-purple-900/50">
                            <PiggyBank className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Profit</span>
                    </div>
                    <div className={`text-3xl font-bold ${profit >= 0 ? "text-slate-900 dark:text-white" : "text-red-600 dark:text-red-400"}`}>
                        {formatCurrency(profit)}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                        <TrendIcon value={profitTrend} />
                        <span className={`text-sm font-medium ${getTrendColor(profitTrend)}`}>
                            {formatTrend(profitTrend)} vs last period
                        </span>
                    </div>
                </div>
            </div>

            {/* Plain-English Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/50">
                        <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Here&apos;s what&apos;s happening
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300">
                            {generateSummary()}
                        </p>

                        {topChannel && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                    🏆 Top performer
                                </span>
                                <span className="text-slate-600 dark:text-slate-300">
                                    {topChannel.name} at {topChannel.roas.toFixed(1)}x ROAS
                                </span>
                            </div>
                        )}

                        {concernChannel && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                                    👀 Keep an eye on
                                </span>
                                <span className="text-slate-600 dark:text-slate-300">
                                    {concernChannel.name}: {concernChannel.issue}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <a
                    href="/analytics"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                    View detailed analytics →
                </a>
                <a
                    href="/analytics/attribution"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                    Check attribution →
                </a>
            </div>
        </div>
    );
}
