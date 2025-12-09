/**
 * Plan utilities for feature gating and limit enforcement.
 * These helpers determine what features are available based on the user's plan.
 */

export type PlanType = "free" | "starter" | "pro" | "agency" | "enterprise";

// Plan hierarchy for comparison
const PLAN_HIERARCHY: Record<PlanType, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  agency: 3,
  enterprise: 4,
};

// Integration limits per plan
const INTEGRATION_LIMITS: Record<PlanType, number> = {
  free: 1,
  starter: 3,
  pro: 5,
  agency: -1, // Unlimited
  enterprise: -1, // Unlimited
};

// Team member limits per plan
const TEAM_MEMBER_LIMITS: Record<PlanType, number> = {
  free: 1,
  starter: 3,
  pro: 10,
  agency: -1, // Unlimited
  enterprise: -1, // Unlimited
};

/**
 * Check if the plan is at least Starter tier
 */
export function isStarter(plan: string): boolean {
  const planKey = plan.toLowerCase() as PlanType;
  return PLAN_HIERARCHY[planKey] >= PLAN_HIERARCHY.starter;
}

/**
 * Check if the plan is at least Pro tier
 */
export function isPro(plan: string): boolean {
  const planKey = plan.toLowerCase() as PlanType;
  return PLAN_HIERARCHY[planKey] >= PLAN_HIERARCHY.pro;
}

/**
 * Check if the plan is at least Agency tier
 */
export function isAgency(plan: string): boolean {
  const planKey = plan.toLowerCase() as PlanType;
  return PLAN_HIERARCHY[planKey] >= PLAN_HIERARCHY.agency;
}

/**
 * Check if the plan is Enterprise tier
 */
export function isEnterprise(plan: string): boolean {
  const planKey = plan.toLowerCase() as PlanType;
  return planKey === "enterprise";
}

/**
 * Get the maximum number of integrations allowed for a plan
 * Returns -1 for unlimited
 */
export function maxIntegrations(plan: string): number {
  const planKey = plan.toLowerCase() as PlanType;
  return INTEGRATION_LIMITS[planKey] ?? INTEGRATION_LIMITS.free;
}

/**
 * Check if the user can add more integrations based on their plan
 */
export function canAddMoreIntegrations(plan: string, currentCount: number): boolean {
  const limit = maxIntegrations(plan);
  if (limit === -1) return true; // Unlimited
  return currentCount < limit;
}

/**
 * Get the maximum number of team members allowed for a plan
 * Returns -1 for unlimited
 */
export function maxTeamMembers(plan: string): number {
  const planKey = plan.toLowerCase() as PlanType;
  return TEAM_MEMBER_LIMITS[planKey] ?? TEAM_MEMBER_LIMITS.free;
}

/**
 * Check if the user can add more team members based on their plan
 */
export function canAddMoreTeamMembers(plan: string, currentCount: number): boolean {
  const limit = maxTeamMembers(plan);
  if (limit === -1) return true; // Unlimited
  return currentCount < limit;
}

/**
 * Get the upgrade suggestion based on current plan
 */
export function getUpgradeSuggestion(plan: string): { plan: PlanType; message: string } | null {
  const planKey = plan.toLowerCase() as PlanType;
  
  switch (planKey) {
    case "free":
      return { plan: "starter", message: "Upgrade to Starter to unlock more integrations and team members." };
    case "starter":
      return { plan: "pro", message: "Upgrade to Pro for more integrations and advanced features." };
    case "pro":
      return { plan: "agency", message: "Upgrade to Agency for unlimited integrations and white-label reports." };
    case "agency":
      return { plan: "enterprise", message: "Contact us for Enterprise features and dedicated support." };
    default:
      return null;
  }
}

/**
 * Get a human-readable plan name
 */
export function getPlanDisplayName(plan: string): string {
  const planKey = plan.toLowerCase() as PlanType;
  const names: Record<PlanType, string> = {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    agency: "Agency",
    enterprise: "Enterprise",
  };
  return names[planKey] ?? plan;
}

/**
 * Check if a specific feature is available for the plan
 */
export function hasFeature(plan: string, feature: string): boolean {
  const planKey = plan.toLowerCase() as PlanType;
  
  const featureRequirements: Record<string, PlanType> = {
    "custom-reports": "pro",
    "api-access": "pro",
    "white-label": "agency",
    "dedicated-support": "agency",
    "sla": "enterprise",
    "custom-onboarding": "enterprise",
  };

  const requiredPlan = featureRequirements[feature];
  if (!requiredPlan) return true; // Feature not restricted

  return PLAN_HIERARCHY[planKey] >= PLAN_HIERARCHY[requiredPlan];
}
