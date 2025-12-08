"use client";

import { useState, useCallback } from "react";
import {
  ReportConfig,
  MetricType,
  DimensionType,
  VisualizationType,
  ReportFilter,
  FilterOperator,
  DEFAULT_REPORT_CONFIG,
  getMetricLabel,
  getDimensionLabel,
  getVisualizationLabel,
  usePreviewReport,
  type ReportResults,
} from "@/hooks/useCustomReports";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { ReportVisualization } from "./report-visualization";

// Available options
const ALL_METRICS: MetricType[] = [
  "revenue", "spend", "profit", "roas", "impressions", 
  "clicks", "conversions", "ctr", "cpc", "cpa", "aov", "orders"
];

const ALL_DIMENSIONS: DimensionType[] = [
  "date", "platform", "campaign", "utm_source", "utm_campaign", "utm_medium"
];

const ALL_VISUALIZATIONS: VisualizationType[] = [
  "table", "line_chart", "bar_chart", "pie_chart", "area_chart", "metric_cards"
];

const DATE_RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "60d", label: "Last 60 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "custom", label: "Custom range" },
];

const FILTER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: "eq", label: "equals" },
  { value: "neq", label: "not equals" },
  { value: "gt", label: "greater than" },
  { value: "gte", label: "greater than or equals" },
  { value: "lt", label: "less than" },
  { value: "lte", label: "less than or equals" },
  { value: "contains", label: "contains" },
];

interface ReportBuilderProps {
  initialConfig?: ReportConfig;
  initialName?: string;
  initialDescription?: string;
  initialVisualization?: VisualizationType;
  initialIsShared?: boolean;
  initialIsFavorite?: boolean;
  onSave: (data: {
    name: string;
    description?: string;
    config: ReportConfig;
    visualization_type: VisualizationType;
    is_shared: boolean;
    is_favorite: boolean;
  }) => Promise<void>;
  isSaving?: boolean;
  mode?: "create" | "edit";
}

export function ReportBuilder({
  initialConfig = DEFAULT_REPORT_CONFIG,
  initialName = "",
  initialDescription = "",
  initialVisualization = "table",
  initialIsShared = false,
  initialIsFavorite = false,
  onSave,
  isSaving = false,
  mode = "create",
}: ReportBuilderProps) {
  // Form state
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [config, setConfig] = useState<ReportConfig>(initialConfig);
  const [visualization, setVisualization] = useState<VisualizationType>(initialVisualization);
  const [isShared, setIsShared] = useState(initialIsShared);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  
  // Preview state
  const [previewResults, setPreviewResults] = useState<ReportResults | null>(null);
  const previewReport = usePreviewReport();

  // Update config helper
  const updateConfig = useCallback((updates: Partial<ReportConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Toggle metric
  const toggleMetric = useCallback((metric: MetricType) => {
    setConfig((prev) => {
      const metrics = prev.metrics.includes(metric)
        ? prev.metrics.filter((m) => m !== metric)
        : [...prev.metrics, metric];
      return { ...prev, metrics };
    });
  }, []);

  // Toggle dimension
  const toggleDimension = useCallback((dimension: DimensionType) => {
    setConfig((prev) => {
      const dimensions = prev.dimensions.includes(dimension)
        ? prev.dimensions.filter((d) => d !== dimension)
        : [...prev.dimensions, dimension];
      return { ...prev, dimensions };
    });
  }, []);

  // Add filter
  const addFilter = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      filters: [...prev.filters, { field: "spend", operator: "gt", value: 0 }],
    }));
  }, []);

  // Update filter
  const updateFilter = useCallback((index: number, updates: Partial<ReportFilter>) => {
    setConfig((prev) => ({
      ...prev,
      filters: prev.filters.map((f, i) => (i === index ? { ...f, ...updates } : f)),
    }));
  }, []);

  // Remove filter
  const removeFilter = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index),
    }));
  }, []);

  // Preview report
  const handlePreview = async () => {
    try {
      const results = await previewReport.mutateAsync(config);
      setPreviewResults(results);
    } catch (err) {
      console.error("Preview failed:", err);
    }
  };

  // Save report
  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a report name");
      return;
    }
    if (config.metrics.length === 0) {
      alert("Please select at least one metric");
      return;
    }
    
    await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      config,
      visualization_type: visualization,
      is_shared: isShared,
      is_favorite: isFavorite,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Builder Panel */}
      <div className="space-y-6">
        {/* Basic Info */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Report Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Report Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekly Performance Summary"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this report track?"
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Share with team</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">⭐ Favorite</span>
              </label>
            </div>
          </div>
        </section>

        {/* Metrics Selection */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Metrics
            <span className="ml-2 text-sm font-normal text-gray-500">({config.metrics.length} selected)</span>
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {ALL_METRICS.map((metric) => {
              const isSelected = config.metrics.includes(metric);
              return (
                <button
                  key={metric}
                  onClick={() => toggleMetric(metric)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isSelected
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {isSelected && "✓ "}
                  {getMetricLabel(metric)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Dimensions Selection */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Group By
            <span className="ml-2 text-sm font-normal text-gray-500">({config.dimensions.length} selected)</span>
          </h2>
          
          <div className="flex flex-wrap gap-2">
            {ALL_DIMENSIONS.map((dimension) => {
              const isSelected = config.dimensions.includes(dimension);
              return (
                <button
                  key={dimension}
                  onClick={() => toggleDimension(dimension)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isSelected
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {isSelected && "✓ "}
                  {getDimensionLabel(dimension)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Date Range */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Date Range</h2>
          
          <div className="space-y-4">
            <select
              aria-label="Date range"
              value={config.date_range}
              onChange={(e) => updateConfig({ date_range: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {config.date_range === "custom" && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">From</label>
                  <input
                    type="date"
                    aria-label="Start date"
                    value={config.custom_date_from || ""}
                    onChange={(e) => updateConfig({ custom_date_from: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">To</label>
                  <input
                    type="date"
                    aria-label="End date"
                    value={config.custom_date_to || ""}
                    onChange={(e) => updateConfig({ custom_date_to: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.compare_previous_period}
                onChange={(e) => updateConfig({ compare_previous_period: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Compare to previous period</span>
            </label>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
            <button
              onClick={addFilter}
              className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              + Add filter
            </button>
          </div>

          {config.filters.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No filters applied</p>
          ) : (
            <div className="space-y-3">
              {config.filters.map((filter, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    aria-label="Filter field"
                    value={filter.field}
                    onChange={(e) => updateFilter(index, { field: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    {ALL_METRICS.map((m) => (
                      <option key={m} value={m}>{getMetricLabel(m)}</option>
                    ))}
                    {ALL_DIMENSIONS.map((d) => (
                      <option key={d} value={d}>{getDimensionLabel(d)}</option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter operator"
                    value={filter.operator}
                    onChange={(e) => updateFilter(index, { operator: e.target.value as FilterOperator })}
                    className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    {FILTER_OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    aria-label="Filter value"
                    value={String(filter.value)}
                    onChange={(e) => updateFilter(index, { value: e.target.value })}
                    placeholder="Value"
                    className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    onClick={() => removeFilter(index)}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label="Remove filter"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Visualization Type */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Visualization</h2>
          
          <div className="grid grid-cols-3 gap-3">
            {ALL_VISUALIZATIONS.map((viz) => {
              const icons: Record<VisualizationType, string> = {
                table: "📊",
                line_chart: "📈",
                bar_chart: "📊",
                pie_chart: "🥧",
                area_chart: "📉",
                metric_cards: "🔢",
              };
              return (
                <button
                  key={viz}
                  onClick={() => setVisualization(viz)}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition ${
                    visualization === viz
                      ? "border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                >
                  <span className="text-2xl">{icons[viz]}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {getVisualizationLabel(viz)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreview}
            disabled={previewReport.isPending || config.metrics.length === 0}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {previewReport.isPending ? "Loading..." : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || config.metrics.length === 0}
            className="flex-1 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : mode === "create" ? "Create Report" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="space-y-6">
        <div className="sticky top-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Preview</h2>
            
            {!previewResults && !previewReport.isPending && (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click &quot;Preview&quot; to see your report
                </p>
              </div>
            )}

            {previewReport.isPending && (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              </div>
            )}

            {previewReport.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                Failed to load preview
              </div>
            )}

            {previewResults && (
              <ReportVisualization
                data={previewResults.data}
                summary={previewResults.summary}
                config={config}
                visualization={visualization}
                comparisonSummary={previewResults.comparison_summary}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
