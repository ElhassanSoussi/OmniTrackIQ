import { apiFetch } from "./api-client";

// --- Interfaces ---

export interface ReportTemplate {
    id: string;
    account_id: string;
    name: string;
    description?: string;
    config_json: Record<string, any>;
    is_public: boolean;
    created_by_user_id?: string;
    created_at: string;
    updated_at?: string;
}

export interface ReportTemplateCreate {
    name: string;
    description?: string;
    config_json: Record<string, any>;
    is_public: boolean;
}

export interface CustomMetric {
    id: string;
    account_id: string;
    name: string;
    description?: string;
    formula: string;
    format: string; // currency, percentage, number, duration
    created_by_user_id?: string;
    created_at: string;
    updated_at?: string;
}

export interface CustomMetricCreate {
    name: string;
    description?: string;
    formula: string;
    format: string;
}

// --- Service Methods ---

// Report Templates
export async function getTemplates(): Promise<ReportTemplate[]> {
    const res = await apiFetch<ReportTemplate[]>("/analytics/templates");
    return res || [];
}

export async function createTemplate(data: ReportTemplateCreate): Promise<ReportTemplate> {
    const res = await apiFetch<ReportTemplate>("/analytics/templates", {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res) throw new Error("Failed to create template");
    return res;
}

export async function deleteTemplate(id: string): Promise<void> {
    await apiFetch<void>(`/analytics/templates/${id}`, {
        method: "DELETE",
    });
}

// Custom Metrics
export async function getCustomMetrics(): Promise<CustomMetric[]> {
    const res = await apiFetch<CustomMetric[]>("/analytics/custom-metrics");
    return res || [];
}

export async function createCustomMetric(data: CustomMetricCreate): Promise<CustomMetric> {
    const res = await apiFetch<CustomMetric>("/analytics/custom-metrics", {
        method: "POST",
        body: JSON.stringify(data),
    });
    if (!res) throw new Error("Failed to create custom metric");
    return res;
}

export async function deleteCustomMetric(id: string): Promise<void> {
    await apiFetch<void>(`/analytics/custom-metrics/${id}`, {
        method: "DELETE",
    });
}
