import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

// ================== Types ==================

export type InsightType =
  | "anomaly_explanation"
  | "trend_analysis"
  | "performance_alert"
  | "optimization_suggestion"
  | "forecast"
  | "correlation"
  | "budget_recommendation";

export type InsightPriority = "low" | "medium" | "high" | "critical";
export type InsightCategory = "revenue" | "spend" | "efficiency" | "growth" | "risk";

export interface Insight {
  type: InsightType;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  metric: string;
  value: number | Record<string, unknown>;
  action?: string;
}

export interface InsightsSummary {
  total_insights: number;
  by_priority: Record<string, number>;
  by_category: Record<string, number>;
  by_type: Record<string, number>;
}

export interface InsightsResponse {
  insights: Insight[];
  summary: InsightsSummary;
  date_range: { from: string; to: string };
  generated_at: string;
}

export interface AnomalyExplanation {
  metric: string;
  date: string;
  anomaly_type: string;
  explanation: string;
  possible_causes: { cause: string; evidence: string; confidence: number }[];
  recommendations: string[];
  confidence_score: number;
  context: {
    anomaly_value: number;
    baseline_average: number;
    change_percent: number;
  };
}

export interface PredictiveAlert {
  metric: string;
  severity: string;
  title: string;
  description: string;
  current_value: number;
  trend_percent: number;
  forecast_7d: number;
  forecast_change_percent: number;
  is_accelerating: boolean;
  action: string;
}

// ================== AI Insights Hooks ==================

export function useInsights(
  dateFrom?: string,
  dateTo?: string,
  includeForecasts: boolean = true,
  includeRecommendations: boolean = true
) {
  return useQuery<InsightsResponse>({
    queryKey: ["insights", dateFrom, dateTo, includeForecasts, includeRecommendations],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      params.set("include_forecasts", String(includeForecasts));
      params.set("include_recommendations", String(includeRecommendations));

      const result = await apiFetch(`/analytics/insights?${params}`);
      return result as InsightsResponse;
    },
  });
}

export function useAnomalyExplanation(
  anomalyDate: string,
  metric: string,
  anomalyType: "spike" | "drop",
  enabled: boolean = true
) {
  return useQuery<AnomalyExplanation>({
    queryKey: ["anomaly-explanation", anomalyDate, metric, anomalyType],
    queryFn: async () => {
      const params = new URLSearchParams({
        anomaly_date: anomalyDate,
        metric,
        anomaly_type: anomalyType,
      });

      const result = await apiFetch(`/analytics/insights/anomaly-explanation?${params}`);
      return result as AnomalyExplanation;
    },
    enabled,
  });
}

export function usePredictiveAlerts(daysAhead: number = 7) {
  return useQuery<PredictiveAlert[]>({
    queryKey: ["predictive-alerts", daysAhead],
    queryFn: async () => {
      const params = new URLSearchParams({ days_ahead: String(daysAhead) });
      const result = await apiFetch(`/analytics/insights/predictive-alerts?${params}`);
      return result as PredictiveAlert[];
    },
  });
}

// ================== Marketing Mix Modeling Types ==================

export interface ChannelContribution {
  channel: string;
  spend: number;
  revenue: number;
  conversions: number;
  impressions: number;
  clicks: number;
  roas: number;
  cpa: number;
  ctr: number;
  cvr: number;
  marginal_roas: number;
  saturation_level: number;
  efficiency_rating: "excellent" | "good" | "moderate" | "break_even" | "poor";
  revenue_share: number;
  spend_share: number;
}

export interface ChannelContributionResponse {
  channels: ChannelContribution[];
  summary: {
    total_revenue: number;
    total_spend: number;
    overall_roas: number;
    channel_count: number;
    top_contributor: string | null;
    most_efficient: string | null;
  };
  date_range: { from: string; to: string };
}

export interface BudgetRecommendation {
  channel: string;
  recommended_spend: number;
  current_spend: number;
  change: number;
  change_percent: number;
  rationale: string;
}

export interface BudgetOptimizationResponse {
  current_allocation: {
    channel: string;
    spend: number;
    share: number;
    roas: number;
  }[];
  recommended_allocation: BudgetRecommendation[];
  expected_impact: {
    current_revenue: number;
    expected_revenue: number;
    revenue_change: number;
    revenue_change_percent: number;
    current_roas: number;
    expected_roas: number;
    roas_change: number;
    spend_change: number;
    confidence_level: string;
  };
  optimization_goal: string;
  total_budget: number;
  date_range: { from: string; to: string };
}

export interface ScenarioResult {
  name: string;
  total_spend: number;
  expected_revenue: number;
  expected_roas: number;
  channel_projections: {
    channel: string;
    spend: number;
    projected_revenue: number;
    projected_roas: number;
  }[];
  vs_baseline?: {
    revenue_change: number;
    revenue_change_percent: number;
    roas_change: number;
  };
}

export interface ScenarioAnalysisResponse {
  baseline: ScenarioResult;
  scenarios: ScenarioResult[];
  best_scenario: string | null;
  date_range: { from: string; to: string };
}

export interface DiminishingReturnsChannel {
  channel: string;
  quartile_analysis: {
    quartile: number;
    label: string;
    days_count: number;
    total_spend: number;
    total_revenue: number;
    avg_daily_spend: number;
    roas: number;
  }[];
  efficiency_drop_percent: number;
  shows_diminishing_returns: boolean;
  optimal_daily_spend_range: { min: number; max: number };
  recommendation: string;
}

export interface DiminishingReturnsResponse {
  channels: DiminishingReturnsChannel[];
  date_range: { from: string; to: string };
}

// ================== MMM Hooks ==================

export type OptimizationGoal = "maximize_revenue" | "maximize_roas" | "minimize_cpa" | "balanced";

export function useChannelContribution(dateFrom?: string, dateTo?: string) {
  return useQuery<ChannelContributionResponse>({
    queryKey: ["channel-contribution", dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const result = await apiFetch(`/analytics/mmm/channel-contribution?${params}`);
      return result as ChannelContributionResponse;
    },
  });
}

export function useBudgetOptimization(
  dateFrom?: string,
  dateTo?: string,
  totalBudget?: number,
  goal: OptimizationGoal = "balanced"
) {
  return useQuery<BudgetOptimizationResponse>({
    queryKey: ["budget-optimization", dateFrom, dateTo, totalBudget, goal],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (totalBudget) params.set("total_budget", String(totalBudget));
      params.set("goal", goal);

      const result = await apiFetch(`/analytics/mmm/budget-optimization?${params}`);
      return result as BudgetOptimizationResponse;
    },
  });
}

export function useScenarioAnalysis() {
  return useMutation<ScenarioAnalysisResponse, Error, { scenarios: Record<string, number>[]; dateFrom?: string; dateTo?: string }>({
    mutationFn: async ({ scenarios, dateFrom, dateTo }) => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const result = await apiFetch(`/analytics/mmm/scenario-analysis?${params}`, {
        method: "POST",
        body: JSON.stringify(scenarios),
      });
      return result as ScenarioAnalysisResponse;
    },
  });
}

export function useDiminishingReturns(dateFrom?: string, dateTo?: string, channel?: string) {
  return useQuery<DiminishingReturnsResponse>({
    queryKey: ["diminishing-returns", dateFrom, dateTo, channel],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (channel) params.set("channel", channel);

      const result = await apiFetch(`/analytics/mmm/diminishing-returns?${params}`);
      return result as DiminishingReturnsResponse;
    },
  });
}

// ================== Incrementality Types ==================

export interface IncrementalityResult {
  channel: string;
  test_period: {
    from: string;
    to: string;
    days: number;
    conversions: number;
    revenue: number;
    spend: number;
    daily_conversions: number;
    daily_revenue: number;
  };
  control_period: {
    from: string;
    to: string;
    days: number;
    conversions: number;
    revenue: number;
    spend: number;
    daily_conversions: number;
    daily_revenue: number;
  };
  results: {
    conversion_lift_percent: number;
    revenue_lift_percent: number;
    incremental_conversions: number;
    incremental_revenue: number;
    incremental_roas: number;
    statistical_significance: number;
    is_significant: boolean;
    confidence_level: string;
  };
  interpretation: {
    overall: string;
    lift_meaning: string;
    iroas_meaning: string;
    recommendation: string;
  };
}

export interface BaselineEstimate {
  channel: string;
  date_range: { from: string; to: string };
  total_conversions: number;
  estimated_baseline: number;
  estimated_incremental: number;
  incrementality_rate: number;
  channel_share_of_total: number;
  methodology: string;
  confidence: string;
  note: string;
}

export interface TestDesign {
  channel: string;
  test_type: string;
  design: {
    test_group: { name: string; budget_allocation: number; description: string };
    holdout_group: { name: string; budget_allocation: number; description: string };
  };
  recommended_duration_days: number;
  minimum_sample_size: number;
  expected_metrics: {
    daily_spend: number;
    daily_conversions: number;
    daily_revenue: number;
    test_spend_reduction: number;
  };
  success_criteria: { statistical_significance: string; minimum_lift_to_detect: string };
  risks: string[];
  recommendations: string[];
}

export interface ConversionLiftResult {
  identifier: string;
  date_range?: { from: string; to: string };
  exposed_group?: {
    impressions: number;
    conversions: number;
    conversion_rate: number;
  };
  baseline_estimate?: {
    conversion_rate: number;
    methodology: string;
  };
  lift_analysis?: {
    absolute_lift: number;
    relative_lift_percent: number;
    incremental_conversions: number;
  };
  confidence: string;
  recommendation?: string;
  message?: string;
}

// ================== Incrementality Hooks ==================

export function useIncrementalityAnalysis(
  channel: string,
  dateFrom?: string,
  dateTo?: string,
  controlStart?: string,
  controlEnd?: string
) {
  return useQuery<IncrementalityResult>({
    queryKey: ["incrementality-analyze", channel, dateFrom, dateTo, controlStart, controlEnd],
    queryFn: async () => {
      const params = new URLSearchParams({ channel });
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (controlStart) params.set("control_start", controlStart);
      if (controlEnd) params.set("control_end", controlEnd);

      const result = await apiFetch(`/analytics/incrementality/analyze?${params}`);
      return result as IncrementalityResult;
    },
    enabled: !!channel,
  });
}

export function useBaselineEstimate(channel: string, dateFrom?: string, dateTo?: string) {
  return useQuery<BaselineEstimate>({
    queryKey: ["baseline-estimate", channel, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams({ channel });
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const result = await apiFetch(`/analytics/incrementality/baseline?${params}`);
      return result as BaselineEstimate;
    },
    enabled: !!channel,
  });
}

export function useTestDesign(
  channel: string,
  durationDays: number = 14,
  holdoutPercent: number = 20
) {
  return useQuery<TestDesign>({
    queryKey: ["test-design", channel, durationDays, holdoutPercent],
    queryFn: async () => {
      const params = new URLSearchParams({
        channel,
        duration_days: String(durationDays),
        holdout_percent: String(holdoutPercent),
      });

      const result = await apiFetch(`/analytics/incrementality/test-design?${params}`);
      return result as TestDesign;
    },
    enabled: !!channel,
  });
}

export function useConversionLift(
  channel?: string,
  campaign?: string,
  dateFrom?: string,
  dateTo?: string
) {
  return useQuery<ConversionLiftResult>({
    queryKey: ["conversion-lift", channel, campaign, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (channel) params.set("channel", channel);
      if (campaign) params.set("campaign", campaign);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const result = await apiFetch(`/analytics/incrementality/conversion-lift?${params}`);
      return result as ConversionLiftResult;
    },
    enabled: !!(channel || campaign),
  });
}
