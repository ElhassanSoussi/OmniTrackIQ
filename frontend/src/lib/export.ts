/**
 * Export utilities for CSV and PDF generation
 */

export interface ExportColumn {
  key: string;
  header: string;
  format?: (value: unknown) => string;
}

/**
 * Convert data array to CSV string
 */
export function toCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[]
): string {
  if (!data.length) return "";

  // Header row
  const headers = columns.map((col) => `"${col.header}"`).join(",");

  // Data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col.key];
        const formatted = col.format ? col.format(value) : String(value ?? "");
        // Escape quotes and wrap in quotes
        return `"${formatted.replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * Download content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
): void {
  const csv = toCSV(data, columns);
  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

/**
 * Format currency for export
 */
export function formatCurrencyExport(value: unknown): string {
  const num = typeof value === "number" ? value : parseFloat(String(value)) || 0;
  return num.toFixed(2);
}

/**
 * Format percentage for export
 */
export function formatPercentExport(value: unknown): string {
  const num = typeof value === "number" ? value : parseFloat(String(value)) || 0;
  return `${num.toFixed(2)}%`;
}

/**
 * Format date for export
 */
export function formatDateExport(value: unknown): string {
  if (!value) return "";
  const date = new Date(String(value));
  return date.toISOString().split("T")[0];
}

/**
 * Format number for export
 */
export function formatNumberExport(value: unknown): string {
  const num = typeof value === "number" ? value : parseFloat(String(value)) || 0;
  return num.toLocaleString();
}

// Pre-defined column configurations for common exports

export const METRICS_COLUMNS: ExportColumn[] = [
  { key: "date", header: "Date", format: formatDateExport },
  { key: "revenue", header: "Revenue", format: formatCurrencyExport },
  { key: "spend", header: "Ad Spend", format: formatCurrencyExport },
  { key: "roas", header: "ROAS", format: (v) => `${Number(v || 0).toFixed(2)}x` },
  { key: "orders", header: "Orders", format: formatNumberExport },
  { key: "clicks", header: "Clicks", format: formatNumberExport },
  { key: "impressions", header: "Impressions", format: formatNumberExport },
  { key: "conversions", header: "Conversions", format: formatNumberExport },
];

export const CAMPAIGN_COLUMNS: ExportColumn[] = [
  { key: "campaign_name", header: "Campaign" },
  { key: "platform", header: "Platform" },
  { key: "spend", header: "Spend", format: formatCurrencyExport },
  { key: "revenue", header: "Revenue", format: formatCurrencyExport },
  { key: "roas", header: "ROAS", format: (v) => `${Number(v || 0).toFixed(2)}x` },
  { key: "impressions", header: "Impressions", format: formatNumberExport },
  { key: "clicks", header: "Clicks", format: formatNumberExport },
  { key: "conversions", header: "Conversions", format: formatNumberExport },
  { key: "ctr", header: "CTR", format: formatPercentExport },
  { key: "cpc", header: "CPC", format: formatCurrencyExport },
  { key: "cpa", header: "CPA", format: formatCurrencyExport },
];

export const ORDER_COLUMNS: ExportColumn[] = [
  { key: "external_order_id", header: "Order ID" },
  { key: "date_time", header: "Date", format: formatDateExport },
  { key: "total_amount", header: "Amount", format: formatCurrencyExport },
  { key: "currency", header: "Currency" },
  { key: "utm_source", header: "UTM Source" },
  { key: "utm_campaign", header: "UTM Campaign" },
  { key: "source_platform", header: "Source Platform" },
];

export const CHANNEL_COLUMNS: ExportColumn[] = [
  { key: "platform_label", header: "Channel" },
  { key: "spend", header: "Spend", format: formatCurrencyExport },
  { key: "revenue", header: "Revenue", format: formatCurrencyExport },
  { key: "roas", header: "ROAS", format: (v) => `${Number(v || 0).toFixed(2)}x` },
  { key: "orders", header: "Orders", format: formatNumberExport },
  { key: "clicks", header: "Clicks", format: formatNumberExport },
  { key: "conversions", header: "Conversions", format: formatNumberExport },
  { key: "ctr", header: "CTR", format: formatPercentExport },
  { key: "cpc", header: "CPC", format: formatCurrencyExport },
  { key: "cpa", header: "CPA", format: formatCurrencyExport },
];
