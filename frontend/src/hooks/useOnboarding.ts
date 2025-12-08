import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { OnboardingStep } from "@/components/ui/onboarding-checklist";

interface IntegrationStatus {
  platform: string;
  connected: boolean;
}

interface TeamInfo {
  current_users: number;
}

interface BillingInfo {
  plan: string;
}

export function useOnboarding() {
  // Check integrations
  const { data: integrations } = useQuery<IntegrationStatus[]>({
    queryKey: ["integrations-status"],
    queryFn: async () => {
      try {
        const result = await apiFetch("/integrations");
        return result as IntegrationStatus[];
      } catch {
        return [];
      }
    },
    staleTime: 60000, // 1 minute
  });
  
  // Check team
  const { data: team } = useQuery<TeamInfo>({
    queryKey: ["team-info"],
    queryFn: async () => {
      try {
        const result = await apiFetch("/team");
        return result as TeamInfo;
      } catch {
        return { current_users: 1 };
      }
    },
    staleTime: 60000,
  });
  
  // Check billing
  const { data: billing } = useQuery<BillingInfo>({
    queryKey: ["billing-info"],
    queryFn: async () => {
      try {
        const result = await apiFetch("/billing");
        return result as BillingInfo;
      } catch {
        return { plan: "free" };
      }
    },
    staleTime: 60000,
  });
  
  // Determine completed steps
  const hasAdPlatform = integrations?.some(
    (i) => i.connected && ["facebook", "google_ads", "tiktok", "snapchat", "pinterest"].includes(i.platform)
  );
  const hasEcommerce = integrations?.some(
    (i) => i.connected && ["shopify", "woocommerce", "bigcommerce"].includes(i.platform)
  );
  const hasTeamMember = (team?.current_users || 1) > 1;
  const hasPaidPlan = billing?.plan && billing.plan !== "free";
  
  const steps: OnboardingStep[] = [
    {
      id: "ad-platform",
      title: "Connect an ad platform",
      description: "Link Facebook, Google, or TikTok Ads to sync campaign data",
      href: "/integrations",
      completed: !!hasAdPlatform,
      icon: "integration",
    },
    {
      id: "ecommerce",
      title: "Connect your store",
      description: "Link Shopify or another platform to sync orders",
      href: "/integrations",
      completed: !!hasEcommerce,
      icon: "order",
    },
    {
      id: "team",
      title: "Invite your team",
      description: "Add team members to collaborate on analytics",
      href: "/settings/team",
      completed: hasTeamMember,
      icon: "team",
    },
    {
      id: "billing",
      title: "Choose a plan",
      description: "Upgrade to unlock advanced features",
      href: "/billing",
      completed: !!hasPaidPlan,
      icon: "billing",
    },
  ];
  
  const completedCount = steps.filter((s) => s.completed).length;
  const isComplete = completedCount === steps.length;
  
  return {
    steps,
    completedCount,
    totalCount: steps.length,
    isComplete,
    progress: steps.length > 0 ? (completedCount / steps.length) * 100 : 0,
  };
}
