"use client";

import { useState } from "react";
import Link from "next/link";
import { useProductProfitability, SortField, SortOrder } from "@/hooks/useProductProfitability";
import { useBilling } from "@/hooks/useBilling";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3, TrendingUp, ArrowUpDown, Lock } from "lucide-react";

type DateRange = "7d" | "14d" | "30d" | "60d" | "90d";

const DATE_RANGES: { value: DateRange; label: string }[] = [
    { value: "7d", label: "Last 7 days" },
    { value: "14d", label: "Last 14 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "60d", label: "Last 60 days" },
    { value: "90d", label: "Last 90 days" },
];

function getDateRange(range: DateRange): { from: string; to: string } {
    const to = new Date();
    const from = new Date();
    const days = parseInt(range);
    from.setDate(from.getDate() - days);
    return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
    };
}

// Get color for profit margin indicator
function getMarginColor(margin: number): string {
    if (margin >= 40) return "text-emerald-600 bg-emerald-50";
    if (margin >= 20) return "text-emerald-500 bg-emerald-50";
    if (margin >= 0) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
}

// Plan upgrade banner for Starter users
function UpgradeBanner() {
    return (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-primary-50 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Lock className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
                Per-Product Profitability
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-600">
                See exactly which products are driving profit and which are eating into margins.
                Available on Pro and Enterprise plans.
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <Link
                    href="/pricing"
                    className="inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                    Upgrade to Pro
                </Link>
                <Link
                    href="/billing"
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    View Plans
                </Link>
            </div>
        </div>
    );
}

export default function ProductProfitabilityPage() {
    const [dateRange, setDateRange] = useState<DateRange>("30d");
    const [sortBy, setSortBy] = useState<SortField>("revenue");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    const { billing, loading: billingLoading } = useBilling();
    const { from, to } = getDateRange(dateRange);

    const { data, isLoading, error, isError } = useProductProfitability(
        from,
        to,
        50,
        sortBy,
        sortOrder,
    );

    // Check if user has access (Pro or Enterprise)
    const plan = billing?.plan || "starter";
    const hasAccess = plan === "pro" || plan === "enterprise";

    // Handle sort column click
    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "desc" ? "asc" : "desc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
    };

    // Sort indicator
    const SortIcon = ({ field }: { field: SortField }) => (
        <ArrowUpDown
            className={`ml-1 inline h-4 w-4 ${sortBy === field ? "text-primary-600" : "text-slate-400"}`}
        />
    );

    // Loading state while checking billing
    if (billingLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
        );
    }

    // Show upgrade banner for Starter users
    if (!hasAccess) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Product Profitability</h1>
                    <p className="mt-1 text-slate-500">
                        Analyze profitability at the product level
                    </p>
                </div>
                <UpgradeBanner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Product Profitability</h1>
                    <p className="mt-1 text-slate-500">
                        Revenue, COGS, and profit margins by product
                    </p>
                </div>

                {/* Date range selector */}
                <div className="flex items-center gap-2">
                    {DATE_RANGES.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setDateRange(range.value)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${dateRange === range.value
                                ? "bg-primary-100 text-primary-700"
                                : "text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                </div>
            )}

            {/* Error state */}
            {isError && (
                <EmptyState
                    icon="chart"
                    title="Failed to load data"
                    description={error?.message || "An error occurred while loading product profitability data."}
                    variant="error"
                />
            )}

            {/* Data display */}
            {data && !isLoading && (
                <>
                    {/* Summary cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-medium text-slate-500">Total Revenue</div>
                            <div className="mt-1 text-2xl font-semibold text-slate-900">
                                {formatCurrency(data.totals.total_revenue)}
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-medium text-slate-500">Total COGS</div>
                            <div className="mt-1 text-2xl font-semibold text-slate-900">
                                {formatCurrency(data.totals.total_cogs)}
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-medium text-slate-500">Gross Profit</div>
                            <div className="mt-1 text-2xl font-semibold text-emerald-600">
                                {formatCurrency(data.totals.total_gross_profit)}
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="text-sm font-medium text-slate-500">Avg Margin</div>
                            <div className="mt-1 text-2xl font-semibold text-slate-900">
                                {formatPercent(data.totals.avg_profit_margin)}
                            </div>
                        </div>
                    </div>

                    {/* Products table */}
                    {data.products.length === 0 ? (
                        <EmptyState
                            icon="trend"
                            title="No product data"
                            description="Generate sample data or connect your Shopify store to see product profitability."
                            actionLabel="Generate Sample Data"
                            actionHref="/settings"
                        />
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Product
                                            </th>
                                            <th
                                                className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 hover:text-slate-900"
                                                onClick={() => handleSort("revenue")}
                                            >
                                                Revenue <SortIcon field="revenue" />
                                            </th>
                                            <th
                                                className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 hover:text-slate-900"
                                                onClick={() => handleSort("units_sold")}
                                            >
                                                Units <SortIcon field="units_sold" />
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Avg Price
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                COGS
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Ad Spend
                                            </th>
                                            <th
                                                className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 hover:text-slate-900"
                                                onClick={() => handleSort("gross_profit")}
                                            >
                                                Profit <SortIcon field="gross_profit" />
                                            </th>
                                            <th
                                                className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 hover:text-slate-900"
                                                onClick={() => handleSort("profit_margin")}
                                            >
                                                Margin <SortIcon field="profit_margin" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.products.map((product) => (
                                            <tr key={product.product_id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-900">{product.product_name}</div>
                                                    <div className="text-xs text-slate-500">{product.product_id}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                    {formatCurrency(product.revenue)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {formatNumber(product.units_sold)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {formatCurrency(product.avg_price)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {formatCurrency(product.cogs)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-700">
                                                    {formatCurrency(product.allocated_ad_spend)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                                    {formatCurrency(product.gross_profit)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-sm font-medium ${getMarginColor(product.profit_margin)}`}
                                                    >
                                                        {formatPercent(product.profit_margin)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer with notes */}
                            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-xs text-slate-500">
                                    {data.notes.ad_spend_allocation}. {data.notes.cogs_note}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
