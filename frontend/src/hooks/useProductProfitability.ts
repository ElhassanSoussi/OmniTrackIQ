import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface ProductProfitabilityItem {
    product_id: string;
    product_name: string;
    revenue: number;
    units_sold: number;
    avg_price: number;
    cogs: number;
    allocated_ad_spend: number;
    gross_profit: number;
    profit_margin: number;
}

export interface ProductProfitabilityTotals {
    product_count: number;
    total_revenue: number;
    total_units: number;
    total_cogs: number;
    total_ad_spend: number;
    total_gross_profit: number;
    avg_profit_margin: number;
}

export interface ProductProfitabilityResponse {
    date_from: string;
    date_to: string;
    products: ProductProfitabilityItem[];
    totals: ProductProfitabilityTotals;
    notes: {
        ad_spend_allocation: string;
        cogs_note: string;
    };
}

export interface PlanRequiredError {
    error: "plan_required";
    message: string;
    current_plan: string;
    upgrade_url: string;
}

export type SortField = "revenue" | "units_sold" | "gross_profit" | "profit_margin";
export type SortOrder = "asc" | "desc";

export function useProductProfitability(
    dateFrom?: string,
    dateTo?: string,
    limit: number = 50,
    sortBy: SortField = "revenue",
    sortOrder: SortOrder = "desc",
) {
    return useQuery<ProductProfitabilityResponse, Error>({
        queryKey: ["product-profitability", dateFrom, dateTo, limit, sortBy, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (dateFrom) params.set("from", dateFrom);
            if (dateTo) params.set("to", dateTo);
            params.set("limit", String(limit));
            params.set("sort_by", sortBy);
            params.set("sort_order", sortOrder);

            const result = await apiFetch(`/products?${params}`);
            return result as ProductProfitabilityResponse;
        },
        retry: (failureCount, error) => {
            // Don't retry on plan_required errors
            if (error.message?.includes("plan_required")) {
                return false;
            }
            return failureCount < 3;
        },
    });
}

export function useProductDataAvailable() {
    return useQuery<{ has_data: boolean; message: string }, Error>({
        queryKey: ["product-data-available"],
        queryFn: async () => {
            const result = await apiFetch("/products/available");
            return result as { has_data: boolean; message: string };
        },
        retry: false,
    });
}
