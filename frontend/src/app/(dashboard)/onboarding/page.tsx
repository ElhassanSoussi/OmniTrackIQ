"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, Building2, Plug, LayoutDashboard, PartyPopper, Loader2 } from "lucide-react";
import { useOnboarding, OnboardingStepName } from "@/hooks/useOnboarding";
import { apiFetch } from "@/lib/api-client";

interface Integration {
  id: string;
  platform: string;
  status: string;
}

interface WorkspaceSettings {
  account_name: string;
  email: string;
  name: string | null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data, isLoading, completeStep, refetch } = useOnboarding();
  const [workspaceName, setWorkspaceName] = useState("");
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

  // Fetch workspace name
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settings = await apiFetch<WorkspaceSettings>("/auth/settings");
        if (settings?.account_name) {
          setWorkspaceName(settings.account_name);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    }
    fetchSettings();
  }, []);

  // Fetch integrations to check if any are connected
  useEffect(() => {
    async function fetchIntegrations() {
      try {
        const result = await apiFetch<Integration[]>("/integrations");
        if (result) {
          setIntegrations(result);
          // If integrations exist and step not completed, mark it
          const hasConnected = result.some(i => i.status === "connected");
          if (hasConnected && data && !data.steps.connected_integration) {
            completeStep("connected_integration");
          }
        }
      } catch (err) {
        console.error("Failed to fetch integrations:", err);
      } finally {
        setLoadingIntegrations(false);
      }
    }
    fetchIntegrations();
  }, [data, completeStep]);

  const handleSaveWorkspace = async () => {
    if (!workspaceName.trim()) return;
    
    setSavingWorkspace(true);
    try {
      await apiFetch("/auth/settings", {
        method: "PATCH",
        body: JSON.stringify({ account_name: workspaceName }),
      });
      await completeStep("created_workspace");
      refetch();
    } catch (err) {
      console.error("Failed to save workspace name:", err);
    } finally {
      setSavingWorkspace(false);
    }
  };

  const handleViewDashboard = async () => {
    await completeStep("viewed_dashboard");
    router.push("/dashboard");
  };

  const handleGoToIntegrations = () => {
    router.push("/integrations");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // If onboarding is complete, show celebration and redirect option
  if (data?.onboarding_completed) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <PartyPopper className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            You&apos;re All Set!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your workspace is ready. Start exploring your marketing analytics dashboard.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  const steps = data?.steps;
  const hasConnectedIntegration = integrations.some(i => i.status === "connected");

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Welcome to OmniTrackIQ
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Let&apos;s get your workspace set up in just a few steps.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Setup Progress</span>
          <span>
            {[steps?.created_workspace, steps?.connected_integration, steps?.viewed_dashboard].filter(Boolean).length} of 3 complete
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ 
              width: `${([steps?.created_workspace, steps?.connected_integration, steps?.viewed_dashboard].filter(Boolean).length / 3) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {/* Step 1: Set up workspace */}
        <div className={`border rounded-xl p-6 transition-colors ${
          steps?.created_workspace 
            ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20" 
            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {steps?.created_workspace ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <Circle className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Set up your workspace
                </h3>
                {steps?.created_workspace && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-full">
                    Complete
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Give your workspace a name to help identify it.
              </p>
              
              {!steps?.created_workspace && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="My Company"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSaveWorkspace}
                    disabled={!workspaceName.trim() || savingWorkspace}
                    className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {savingWorkspace ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              )}
              
              {steps?.created_workspace && (
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  ✓ Workspace &quot;{workspaceName}&quot; is set up
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Connect integration */}
        <div className={`border rounded-xl p-6 transition-colors ${
          steps?.connected_integration 
            ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20" 
            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {steps?.connected_integration ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <Circle className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Plug className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Connect your first integration
                </h3>
                {steps?.connected_integration && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-full">
                    Complete
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Connect Facebook Ads, Google Ads, TikTok Ads, Shopify, or GA4 to start tracking your marketing data.
              </p>
              
              {!steps?.connected_integration && (
                <button
                  onClick={handleGoToIntegrations}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Go to Integrations
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              
              {steps?.connected_integration && (
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  ✓ {integrations.filter(i => i.status === "connected").length} integration(s) connected
                </p>
              )}

              {!loadingIntegrations && hasConnectedIntegration && !steps?.connected_integration && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  You have connected integrations! Click below to mark this step complete.
                  <button 
                    onClick={() => completeStep("connected_integration")}
                    className="ml-2 underline hover:no-underline"
                  >
                    Mark complete
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: View dashboard */}
        <div className={`border rounded-xl p-6 transition-colors ${
          steps?.viewed_dashboard 
            ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20" 
            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {steps?.viewed_dashboard ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <Circle className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <LayoutDashboard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  View your dashboard
                </h3>
                {steps?.viewed_dashboard && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-full">
                    Complete
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Explore your analytics dashboard and see your marketing data in action.
              </p>
              
              {!steps?.viewed_dashboard && (
                <button
                  onClick={handleViewDashboard}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  View Dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              
              {steps?.viewed_dashboard && (
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  ✓ You&apos;ve viewed your dashboard
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skip option */}
      <div className="mt-8 text-center">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Skip for now and go to dashboard →
        </Link>
      </div>
    </div>
  );
}
