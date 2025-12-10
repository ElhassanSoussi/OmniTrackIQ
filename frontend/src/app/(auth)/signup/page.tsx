"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SocialLoginButtons } from "@/components/auth";
import { getOnboardingStatus } from "@/hooks/useOnboarding";
import { trackEvent } from "@/lib/analytics";

// Client-side validation helpers
function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

function validateAccountName(name: string): string | null {
  if (!name.trim()) return "Account name is required";
  if (name.trim().length < 2) return "Account name must be at least 2 characters";
  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const { user, signup, loading: authLoading, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; accountName?: string; form?: string }>({});

  const isBusy = useMemo(() => authLoading || submitting, [authLoading, submitting]);

  useEffect(() => {
    async function checkOnboardingAndRedirect() {
      if (!authLoading && user) {
        // New users should go to onboarding
        const onboarding = await getOnboardingStatus();
        if (onboarding && !onboarding.onboarding_completed) {
          router.replace("/onboarding");
        } else {
          router.replace("/dashboard");
        }
      }
    }
    checkOnboardingAndRedirect();
  }, [authLoading, router, user]);

  useEffect(() => {
    if (authError) {
      setFieldErrors({ form: authError });
    }
  }, [authError]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Client-side validation
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const accountNameError = validateAccountName(accountName);
    
    if (emailError || passwordError || accountNameError) {
      setFieldErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
        accountName: accountNameError || undefined,
      });
      return;
    }
    
    setFieldErrors({});
    setSubmitting(true);

    try {
      await signup({ email, password, accountName });
      // Track successful signup
      trackEvent("signup_completed");
      // New signups should go to onboarding
      router.push("/onboarding");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setFieldErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gh-canvas-subtle px-4 py-8 dark:bg-gh-canvas-dark">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-md border border-gh-border bg-gh-canvas-default p-6 shadow-gh-md dark:border-gh-border-dark dark:bg-gh-canvas-subtle-dark">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Create your account</h1>
          <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Start your free trial today</p>
        </div>

        {/* Social Login Buttons */}
        <SocialLoginButtons mode="signup" />
        
        <div className="space-y-1">
          <label htmlFor="accountName" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Account name</label>
          <input
            id="accountName"
            className={`gh-input w-full rounded-md border px-3 py-2 text-sm text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark ${
              fieldErrors.accountName ? "border-gh-danger bg-gh-danger-subtle dark:border-gh-danger-dark" : "border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark"
            }`}
            placeholder="Your company or team name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
          {fieldErrors.accountName && <p className="text-xs text-gh-danger dark:text-gh-danger-dark">{fieldErrors.accountName}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Email</label>
          <input
            id="email"
            className={`gh-input w-full rounded-md border px-3 py-2 text-sm text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark ${
              fieldErrors.email ? "border-gh-danger bg-gh-danger-subtle dark:border-gh-danger-dark" : "border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark"
            }`}
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email && <p className="text-xs text-gh-danger dark:text-gh-danger-dark">{fieldErrors.email}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Password</label>
          <input
            id="password"
            className={`gh-input w-full rounded-md border px-3 py-2 text-sm text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark ${
              fieldErrors.password ? "border-gh-danger bg-gh-danger-subtle dark:border-gh-danger-dark" : "border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark"
            }`}
            placeholder="At least 8 characters"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password && <p className="text-xs text-gh-danger dark:text-gh-danger-dark">{fieldErrors.password}</p>}
        </div>
        
        {fieldErrors.form && (
          <div className="gh-flash-danger rounded-md border border-gh-danger bg-gh-danger-subtle px-3 py-2 text-sm text-gh-danger dark:border-gh-danger-dark dark:bg-gh-danger-subtle-dark dark:text-gh-danger-dark">
            {fieldErrors.form}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isBusy}
          className="gh-btn-primary w-full rounded-md bg-brand-500 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? "Creating account..." : "Create account"}
        </button>
        
        <p className="text-center text-xs text-gh-text-secondary dark:text-gh-text-secondary-dark">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-gh-link hover:underline dark:text-gh-link-dark">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-gh-link hover:underline dark:text-gh-link-dark">
            Privacy Policy
          </Link>
        </p>
        
        <p className="text-center text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gh-link hover:underline dark:text-gh-link-dark">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
