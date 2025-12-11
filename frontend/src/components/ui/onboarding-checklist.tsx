"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  icon: "integration" | "campaign" | "order" | "team" | "billing";
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  onDismiss?: () => void;
  title?: string;
  subtitle?: string;
}

const STEP_ICONS = {
  integration: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  campaign: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  order: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  team: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  billing: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
};

export function OnboardingChecklist({
  steps,
  onDismiss,
  title = "Get started with OmniTrackIQ",
  subtitle = "Complete these steps to unlock the full power of your analytics",
}: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  // Check local storage for dismissed state
  useEffect(() => {
    const dismissed = localStorage.getItem("onboarding_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);
  
  const handleDismiss = () => {
    localStorage.setItem("onboarding_dismissed", "true");
    setIsDismissed(true);
    onDismiss?.();
  };
  
  if (isDismissed || completedCount === totalCount) {
    return null;
  }
  
  return (
    <div className="rounded-md border border-brand-300 bg-gradient-to-r from-brand-50 to-gh-canvas-default dark:border-brand-700 dark:from-brand-900/20 dark:to-gh-canvas-dark">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
            <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">{title}</h3>
            <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-md p-2 text-gh-text-tertiary hover:bg-gh-canvas-subtle hover:text-gh-text-secondary dark:text-gh-text-tertiary-dark dark:hover:bg-gh-canvas-subtle-dark dark:hover:text-gh-text-secondary-dark"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-md p-2 text-gh-text-tertiary hover:bg-gh-canvas-subtle hover:text-gh-text-secondary dark:text-gh-text-tertiary-dark dark:hover:bg-gh-canvas-subtle-dark dark:hover:text-gh-text-secondary-dark"
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="h-2 overflow-hidden rounded-full bg-gh-canvas-subtle dark:bg-gh-canvas-subtle-dark">
          <div
            className="h-full bg-brand-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Steps */}
      {isExpanded && (
        <div className="border-t border-brand-100 px-4 py-3 dark:border-brand-800">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <Link
                key={step.id}
                href={step.href}
                className={`flex items-center gap-3 rounded-md p-3 transition ${
                  step.completed
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                    : "bg-gh-canvas-default hover:bg-gh-canvas-subtle dark:bg-gh-canvas-dark dark:hover:bg-gh-canvas-subtle-dark"
                }`}
              >
                {/* Step number or check */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step.completed
                      ? "bg-brand-500 text-white"
                      : "border-2 border-gh-border text-gh-text-secondary dark:border-gh-border-dark dark:text-gh-text-secondary-dark"
                  }`}
                >
                  {step.completed ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                
                {/* Icon */}
                <div className={`${step.completed ? "text-brand-600 dark:text-brand-400" : "text-gh-text-tertiary dark:text-gh-text-tertiary-dark"}`}>
                  {STEP_ICONS[step.icon]}
                </div>
                
                {/* Text */}
                <div className="flex-1">
                  <p className={`font-medium ${step.completed ? "text-brand-700 dark:text-brand-400" : "text-gh-text-primary dark:text-gh-text-primary-dark"}`}>
                    {step.title}
                  </p>
                  <p className={`text-sm ${step.completed ? "text-brand-600 dark:text-brand-500" : "text-gh-text-secondary dark:text-gh-text-secondary-dark"}`}>
                    {step.description}
                  </p>
                </div>
                
                {/* Arrow */}
                {!step.completed && (
                  <svg className="h-5 w-5 text-gh-text-tertiary dark:text-gh-text-tertiary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
          
          {/* Continue onboarding button */}
          <div className="mt-4 flex justify-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Continue onboarding
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          {/* Help text */}
          <p className="mt-4 text-center text-xs text-gh-text-secondary dark:text-gh-text-secondary-dark">
            Need help? Check our{" "}
            <a href="/docs" className="text-brand-500 hover:underline dark:text-brand-400">
              documentation
            </a>{" "}
            or{" "}
            <a href="mailto:support@omnitrackiq.com" className="text-brand-500 hover:underline dark:text-brand-400">
              contact support
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
