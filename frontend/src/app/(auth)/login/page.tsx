"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SocialLoginButtons } from "@/components/auth";
import { getOnboardingStatus } from "@/hooks/useOnboarding";

// Client-side validation helpers
function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const isBusy = useMemo(() => authLoading || submitting, [authLoading, submitting]);

  useEffect(() => {
    async function checkOnboardingAndRedirect() {
      if (!authLoading && user) {
        // Check onboarding status before redirecting
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
    
    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
      });
      return;
    }
    
    setFieldErrors({});
    setSubmitting(true);

    try {
      await login(email, password);
      // Check onboarding status after login
      const onboarding = await getOnboardingStatus();
      if (onboarding && !onboarding.onboarding_completed) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setFieldErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gh-canvas-subtle px-4 dark:bg-gh-canvas-dark">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-md border border-gh-border bg-gh-canvas-default p-6 shadow-gh-md dark:border-gh-border-dark dark:bg-gh-canvas-subtle-dark">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-gh-text-primary dark:text-gh-text-primary-dark">Welcome back</h1>
          <p className="text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">Sign in to your account</p>
        </div>

        {/* Social Login Buttons */}
        <SocialLoginButtons mode="login" />
        
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gh-text-primary dark:text-gh-text-primary-dark">Password</label>
            <Link href="/forgot-password" className="text-xs text-gh-link hover:underline dark:text-gh-link-dark">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            className={`gh-input w-full rounded-md border px-3 py-2 text-sm text-gh-text-primary placeholder:text-gh-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-gh-text-primary-dark dark:placeholder:text-gh-text-tertiary-dark ${
              fieldErrors.password ? "border-gh-danger bg-gh-danger-subtle dark:border-gh-danger-dark" : "border-gh-border bg-gh-canvas-default dark:border-gh-border-dark dark:bg-gh-canvas-dark"
            }`}
            placeholder="Enter your password"
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
          {isBusy ? "Signing in..." : "Sign in"}
        </button>
        
        <p className="text-center text-sm text-gh-text-secondary dark:text-gh-text-secondary-dark">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-gh-link hover:underline dark:text-gh-link-dark">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
