"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics";
import type { OnboardingStep } from "@/components/ui/onboarding-checklist";

export interface OnboardingSteps {
  created_workspace: boolean;
  connected_integration: boolean;
  viewed_dashboard: boolean;
}

export interface OnboardingStatus {
  onboarding_completed: boolean;
  steps: OnboardingSteps;
}

export type OnboardingStepName = "created_workspace" | "connected_integration" | "viewed_dashboard";

// Map backend step names to UI-friendly step objects
function mapStepsToUI(backendSteps: OnboardingSteps | undefined): OnboardingStep[] {
  const steps = backendSteps ?? { created_workspace: false, connected_integration: false, viewed_dashboard: false };
  
  return [
    {
      id: "created_workspace",
      title: "Set up your workspace",
      description: "Configure your workspace name and preferences",
      href: "/onboarding",
      completed: steps.created_workspace,
      icon: "team" as const,
    },
    {
      id: "connected_integration",
      title: "Connect your first integration",
      description: "Link your ad platforms and data sources",
      href: "/integrations",
      completed: steps.connected_integration,
      icon: "integration" as const,
    },
    {
      id: "viewed_dashboard",
      title: "View your dashboard",
      description: "See your unified analytics dashboard",
      href: "/dashboard",
      completed: steps.viewed_dashboard,
      icon: "campaign" as const,
    },
  ];
}

export function useOnboarding() {
  const [data, setData] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      const status = await apiFetch<OnboardingStatus>("/onboarding/status");
      if (status) {
        setData(status);
      }
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err.message : "Failed to fetch onboarding status");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeStep = useCallback(async (step: OnboardingStepName): Promise<OnboardingStatus | null> => {
    try {
      const result = await apiFetch<OnboardingStatus>("/onboarding/complete-step", {
        method: "POST",
        body: JSON.stringify({ step }),
      });
      if (result) {
        setData(result);
        // Track onboarding completed when all steps are done
        if (result.onboarding_completed && !data?.onboarding_completed) {
          trackEvent("onboarding_completed");
        }
        return result;
      }
      return null;
    } catch (err) {
      console.error("Failed to complete onboarding step:", err);
      return null;
    }
  }, [data?.onboarding_completed]);

  const resetOnboarding = useCallback(async (): Promise<boolean> => {
    try {
      const result = await apiFetch<OnboardingStatus>("/onboarding/reset", {
        method: "POST",
      });
      if (result) {
        setData(result);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to reset onboarding:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Calculate progress for backward compatibility
  const steps = data?.steps;
  const completedCount = steps 
    ? [steps.created_workspace, steps.connected_integration, steps.viewed_dashboard].filter(Boolean).length 
    : 0;
  const totalCount = 3;

  const uiSteps = useMemo(() => mapStepsToUI(data?.steps), [data?.steps]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchStatus,
    completeStep,
    resetOnboarding,
    // Backward compatibility props
    completedCount,
    totalCount,
    isComplete: data?.onboarding_completed ?? false,
    progress: (completedCount / totalCount) * 100,
    steps: uiSteps,
  };
}

// Standalone function for use outside of React components
export async function getOnboardingStatus(): Promise<OnboardingStatus | null> {
  try {
    const result = await apiFetch<OnboardingStatus>("/onboarding/status");
    return result ?? null;
  } catch {
    return null;
  }
}

export async function completeOnboardingStep(step: OnboardingStepName): Promise<OnboardingStatus | null> {
  try {
    const result = await apiFetch<OnboardingStatus>("/onboarding/complete-step", {
      method: "POST",
      body: JSON.stringify({ step }),
    });
    return result ?? null;
  } catch {
    return null;
  }
}
