/**
 * Product analytics helper for OmniTrackIQ.
 * 
 * This module provides a simple, privacy-respecting event tracking abstraction.
 * Events are sent to our internal `/events/track` endpoint.
 * 
 * Future integrations (Segment, Amplitude, Mixpanel, etc.) can be added here
 * without changing the calling code throughout the app.
 */

// Allowed event names - must match backend whitelist
export type ProductEventName =
  // Authentication & Onboarding
  | "signup_completed"
  | "onboarding_completed"
  // Integrations
  | "integration_connected"
  | "integration_disconnected"
  // Dashboard Views
  | "viewed_overview_dashboard"
  | "viewed_campaigns_dashboard"
  | "viewed_orders_dashboard"
  // Billing & Trial
  | "started_trial"
  | "trial_expired"
  | "subscription_activated"
  | "subscription_cancelled"
  // Demo
  | "demo_login"
  | "demo_to_signup"
  // Feature Usage
  | "report_created"
  | "report_exported"
  | "team_member_invited";

// API base URL - same as api-client
const API_BASE_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return "http://localhost:8000";
  return raw.startsWith("http") ? raw.replace(/\/+$/, "") : `https://${raw.replace(/\/+$/, "")}`;
})();

// Session-level tracking for "first time" events
const viewedDashboardsThisSession = new Set<string>();

/**
 * Get the auth token if available (for authenticated tracking)
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

/**
 * Track a product event.
 * 
 * This is fire-and-forget - it won't block the UI and failures are silently ignored.
 * Events are sent to the backend `/events/track` endpoint.
 * 
 * @param name - The event name (from ProductEventName union)
 * @param props - Optional additional properties
 * 
 * @example
 * ```ts
 * trackEvent("signup_completed");
 * trackEvent("integration_connected", { integration_type: "facebook", is_trial: true });
 * ```
 */
export function trackEvent(
  name: ProductEventName,
  props?: Record<string, unknown>
): void {
  // Guard: only run on client side
  if (typeof window === "undefined") return;

  // Build properties with automatic context
  const properties: Record<string, unknown> = {
    ...props,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
    // Referrer without sensitive query params
    referrer: document.referrer ? new URL(document.referrer).pathname : undefined,
  };

  // Get auth token if available
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Fire and forget - don't await, don't block UI
  fetch(`${API_BASE_URL}/events/track`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      event_name: name,
      properties,
    }),
    // Don't include credentials for unauthenticated tracking
    credentials: token ? "include" : "omit",
  }).catch((err) => {
    // Only warn in development, silently ignore in production
    if (process.env.NODE_ENV === "development") {
      console.warn("[analytics] Failed to track event:", name, err);
    }
  });
}

/**
 * Track a dashboard view event, but only once per session.
 * This prevents spamming events when users navigate back and forth.
 * 
 * @param dashboardType - The type of dashboard being viewed
 */
export function trackDashboardView(
  dashboardType: "overview" | "campaigns" | "orders"
): void {
  const eventKey = `dashboard_${dashboardType}`;
  
  // Only track first view per session
  if (viewedDashboardsThisSession.has(eventKey)) {
    return;
  }
  
  viewedDashboardsThisSession.add(eventKey);
  
  const eventMap: Record<string, ProductEventName> = {
    dashboard_overview: "viewed_overview_dashboard",
    dashboard_campaigns: "viewed_campaigns_dashboard",
    dashboard_orders: "viewed_orders_dashboard",
  };
  
  const eventName = eventMap[eventKey];
  if (eventName) {
    trackEvent(eventName);
  }
}

/**
 * Track integration connection event with context.
 * 
 * @param integrationType - The platform connected (facebook, google_ads, etc.)
 * @param workspacePlan - Current workspace plan
 * @param isTrial - Whether the workspace is on trial
 */
export function trackIntegrationConnected(
  integrationType: string,
  workspacePlan?: string,
  isTrial?: boolean
): void {
  trackEvent("integration_connected", {
    integration_type: integrationType,
    workspace_plan: workspacePlan,
    is_trial: isTrial,
  });
}

/**
 * Track subscription activation with plan details.
 * 
 * @param plan - The activated plan
 * @param fromTrial - Whether this was a trial conversion
 */
export function trackSubscriptionActivated(
  plan: string,
  fromTrial?: boolean
): void {
  trackEvent("subscription_activated", {
    plan,
    from_trial: fromTrial,
  });
}

// Re-export for convenience
export { trackEvent as track };
