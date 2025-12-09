"use client";

import { useState } from "react";
import {
  useIncrementalityAnalysis,
  useBaselineEstimate,
  useTestDesign,
  useConversionLift,
} from "@/hooks/useInsights";
import { getDateRange, DateRangeValue } from "@/lib/date-range";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

const CHANNELS = [
  { value: "facebook", label: "Facebook" },
  { value: "google_ads", label: "Google Ads" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
];

function MetricCard({ label, value, subtext, highlight }: { label: string; value: string; subtext?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50"}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold mt-1 ${highlight ? "text-emerald-700" : "text-gray-900"}`}>{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
    </div>
  );
}

export default function IncrementalityPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const [selectedChannel, setSelectedChannel] = useState<string>("facebook");
  const [activeTab, setActiveTab] = useState<"analysis" | "baseline" | "test-design" | "lift">("analysis");
  const [testDuration, setTestDuration] = useState(14);
  const [holdoutPercent, setHoldoutPercent] = useState(20);

  const { from, to } = getDateRange(range);

  const { data: analysis, isLoading: analysisLoading, error: analysisError } = useIncrementalityAnalysis(
    selectedChannel,
    from,
    to
  );
  const { data: baseline, isLoading: baselineLoading } = useBaselineEstimate(selectedChannel, from, to);
  const { data: testDesign, isLoading: testDesignLoading } = useTestDesign(
    selectedChannel,
    testDuration,
    holdoutPercent
  );
  const { data: lift, isLoading: liftLoading } = useConversionLift(selectedChannel, undefined, from, to);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incrementality Testing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Measure the true incremental impact of your marketing spend
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            {CHANNELS.map((ch) => (
              <option key={ch.value} value={ch.value}>
                {ch.label}
              </option>
            ))}
          </select>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as DateRangeValue)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="14d">Last 14 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 overflow-x-auto">
          {[
            { id: "analysis", label: "Time-Based Analysis" },
            { id: "baseline", label: "Baseline Estimation" },
            { id: "lift", label: "Conversion Lift" },
            { id: "test-design", label: "Test Design" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Time-Based Analysis Tab */}
      {activeTab === "analysis" && (
        <div className="space-y-6">
          {analysisLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 rounded-xl bg-gray-100" />
              <div className="h-48 rounded-xl bg-gray-100" />
            </div>
          ) : analysisError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load incrementality analysis
            </div>
          ) : analysis && !("message" in analysis && !analysis.results) ? (
            <>
              {/* Results Summary */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Incrementality Results</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetricCard
                    label="Conversion Lift"
                    value={`${analysis.results.conversion_lift_percent >= 0 ? "+" : ""}${analysis.results.conversion_lift_percent.toFixed(1)}%`}
                    highlight={analysis.results.conversion_lift_percent > 0}
                  />
                  <MetricCard
                    label="Revenue Lift"
                    value={`${analysis.results.revenue_lift_percent >= 0 ? "+" : ""}${analysis.results.revenue_lift_percent.toFixed(1)}%`}
                    highlight={analysis.results.revenue_lift_percent > 0}
                  />
                  <MetricCard
                    label="Incremental ROAS"
                    value={`${analysis.results.incremental_roas.toFixed(2)}x`}
                    subtext={analysis.results.incremental_roas > 1 ? "Profitable" : "Below break-even"}
                    highlight={analysis.results.incremental_roas > 1}
                  />
                  <MetricCard
                    label="Significance"
                    value={`${analysis.results.statistical_significance.toFixed(0)}%`}
                    subtext={analysis.results.confidence_level}
                    highlight={analysis.results.is_significant}
                  />
                </div>
              </div>

              {/* Period Comparison */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    Test Period
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    {analysis.test_period.from} to {analysis.test_period.to} ({analysis.test_period.days} days)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Conversions</p>
                      <p className="text-lg font-semibold">{analysis.test_period.conversions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-lg font-semibold">{formatCurrency(analysis.test_period.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Daily Conversions</p>
                      <p className="text-lg font-semibold">{analysis.test_period.daily_conversions.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Daily Revenue</p>
                      <p className="text-lg font-semibold">{formatCurrency(analysis.test_period.daily_revenue)}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400" />
                    Control Period
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    {analysis.control_period.from} to {analysis.control_period.to} ({analysis.control_period.days} days)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Conversions</p>
                      <p className="text-lg font-semibold">{analysis.control_period.conversions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="text-lg font-semibold">{formatCurrency(analysis.control_period.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Daily Conversions</p>
                      <p className="text-lg font-semibold">{analysis.control_period.daily_conversions.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Daily Revenue</p>
                      <p className="text-lg font-semibold">{formatCurrency(analysis.control_period.daily_revenue)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interpretation */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <h4 className="font-semibold text-blue-900 mb-3">Interpretation</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Overall:</strong> {analysis.interpretation.overall}</p>
                  <p><strong>Lift Meaning:</strong> {analysis.interpretation.lift_meaning}</p>
                  <p><strong>iROAS Meaning:</strong> {analysis.interpretation.iroas_meaning}</p>
                  <p className="font-medium text-blue-900 mt-3">
                    → Recommendation: {analysis.interpretation.recommendation}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">No data available for {selectedChannel}. Try a different channel or date range.</p>
            </div>
          )}
        </div>
      )}

      {/* Baseline Estimation Tab */}
      {activeTab === "baseline" && (
        <div className="space-y-6">
          {baselineLoading ? (
            <div className="animate-pulse h-48 rounded-xl bg-gray-100" />
          ) : baseline ? (
            <>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Baseline Conversion Estimation</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetricCard
                    label="Total Conversions"
                    value={formatNumber(baseline.total_conversions)}
                  />
                  <MetricCard
                    label="Estimated Baseline"
                    value={formatNumber(baseline.estimated_baseline)}
                    subtext="Would happen without ads"
                  />
                  <MetricCard
                    label="Incremental Conversions"
                    value={formatNumber(baseline.estimated_incremental)}
                    subtext="Driven by ads"
                    highlight
                  />
                  <MetricCard
                    label="Incrementality Rate"
                    value={`${baseline.incrementality_rate.toFixed(1)}%`}
                    subtext="% truly incremental"
                    highlight
                  />
                </div>
              </div>

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> {baseline.note}
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Methodology: {baseline.methodology} | Confidence: {baseline.confidence}
                </p>
              </div>

              {/* Visual representation */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h4 className="font-medium text-gray-700 mb-4">Conversion Breakdown</h4>
                <div className="relative h-8 w-full rounded-full overflow-hidden bg-gray-200">
                  <div
                    className="absolute left-0 top-0 h-full bg-gray-400"
                    style={{ width: `${100 - baseline.incrementality_rate}%` }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full bg-emerald-500"
                    style={{ width: `${baseline.incrementality_rate}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-600">
                    <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-1" />
                    Baseline ({(100 - baseline.incrementality_rate).toFixed(1)}%)
                  </span>
                  <span className="text-emerald-600">
                    <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 mr-1" />
                    Incremental ({baseline.incrementality_rate.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">No data available for baseline estimation.</p>
            </div>
          )}
        </div>
      )}

      {/* Conversion Lift Tab */}
      {activeTab === "lift" && (
        <div className="space-y-6">
          {liftLoading ? (
            <div className="animate-pulse h-48 rounded-xl bg-gray-100" />
          ) : lift && !lift.message ? (
            <>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Conversion Lift Analysis</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Exposed Group</h4>
                    {lift.exposed_group && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Impressions</span>
                          <span className="font-medium">{formatNumber(lift.exposed_group.impressions)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Conversions</span>
                          <span className="font-medium">{formatNumber(lift.exposed_group.conversions)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Conversion Rate</span>
                          <span className="font-medium">{(lift.exposed_group.conversion_rate * 100).toFixed(4)}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Baseline Estimate</h4>
                    {lift.baseline_estimate && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Est. Conversion Rate</span>
                          <span className="font-medium">{(lift.baseline_estimate.conversion_rate * 100).toFixed(4)}%</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{lift.baseline_estimate.methodology}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {lift.lift_analysis && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <h4 className="font-semibold text-emerald-900 mb-3">Lift Results</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-emerald-700">Absolute Lift</p>
                      <p className="text-xl font-bold text-emerald-900">
                        {(lift.lift_analysis.absolute_lift * 100).toFixed(4)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-700">Relative Lift</p>
                      <p className="text-xl font-bold text-emerald-900">
                        +{lift.lift_analysis.relative_lift_percent.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-700">Incremental Conversions</p>
                      <p className="text-xl font-bold text-emerald-900">
                        {formatNumber(lift.lift_analysis.incremental_conversions)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Confidence Level:</strong> {lift.confidence}
                </p>
                {lift.recommendation && (
                  <p className="text-sm text-yellow-700 mt-2">
                    → {lift.recommendation}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">No lift data available. Need impression and conversion data.</p>
            </div>
          )}
        </div>
      )}

      {/* Test Design Tab */}
      {activeTab === "test-design" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-wrap gap-4">
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Duration</label>
              <select
                value={testDuration}
                onChange={(e) => setTestDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={21}>21 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Holdout %</label>
              <select
                value={holdoutPercent}
                onChange={(e) => setHoldoutPercent(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value={10}>10%</option>
                <option value={20}>20%</option>
                <option value={30}>30%</option>
                <option value={50}>50%</option>
              </select>
            </div>
          </div>

          {testDesignLoading ? (
            <div className="animate-pulse h-64 rounded-xl bg-gray-100" />
          ) : testDesign ? (
            <>
              {/* Test Groups */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <h4 className="font-semibold text-emerald-900 mb-2">{testDesign.design.test_group.name}</h4>
                  <p className="text-3xl font-bold text-emerald-700 mb-2">
                    {testDesign.design.test_group.budget_allocation}%
                  </p>
                  <p className="text-sm text-emerald-700">{testDesign.design.test_group.description}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <h4 className="font-semibold text-gray-900 mb-2">{testDesign.design.holdout_group.name}</h4>
                  <p className="text-3xl font-bold text-gray-700 mb-2">
                    {testDesign.design.holdout_group.budget_allocation}%
                  </p>
                  <p className="text-sm text-gray-600">{testDesign.design.holdout_group.description}</p>
                </div>
              </div>

              {/* Expected Metrics */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h4 className="font-semibold text-gray-900 mb-4">Expected Test Parameters</h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <MetricCard
                    label="Recommended Duration"
                    value={`${testDesign.recommended_duration_days} days`}
                  />
                  <MetricCard
                    label="Min Sample Size"
                    value={formatNumber(testDesign.minimum_sample_size)}
                  />
                  <MetricCard
                    label="Expected Daily Spend"
                    value={formatCurrency(testDesign.expected_metrics.daily_spend)}
                  />
                  <MetricCard
                    label="Spend Reduction"
                    value={formatCurrency(testDesign.expected_metrics.test_spend_reduction)}
                    subtext="During test period"
                  />
                </div>
              </div>

              {/* Success Criteria */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <h4 className="font-semibold text-blue-900 mb-3">Success Criteria</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Statistical Significance</p>
                    <p className="font-semibold text-blue-900">{testDesign.success_criteria.statistical_significance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Minimum Lift to Detect</p>
                    <p className="font-semibold text-blue-900">{testDesign.success_criteria.minimum_lift_to_detect}</p>
                  </div>
                </div>
              </div>

              {/* Risks & Recommendations */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                  <h4 className="font-semibold text-red-900 mb-3">⚠️ Risks</h4>
                  <ul className="space-y-2">
                    {testDesign.risks.map((risk, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                        <span>•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                  <h4 className="font-semibold text-green-900 mb-3">✓ Recommendations</h4>
                  <ul className="space-y-2">
                    {testDesign.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                        <span>•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">Unable to generate test design. Need historical performance data.</p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
        <h3 className="font-semibold text-gray-900 mb-3">About Incrementality Testing</h3>
        <p className="text-sm text-gray-600 mb-4">
          Incrementality testing helps you understand the true impact of your marketing by measuring 
          what would have happened without your ads. This is crucial for accurate budget allocation.
        </p>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="font-medium text-gray-900">Time-Based Analysis</p>
            <p className="text-gray-500">Compare performance across different time periods</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Baseline Estimation</p>
            <p className="text-gray-500">Estimate organic conversions without marketing</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Holdout Testing</p>
            <p className="text-gray-500">Design experiments to measure true lift</p>
          </div>
        </div>
      </div>
    </div>
  );
}
