"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SocialLoginButtons } from "@/components/auth";
import { getOnboardingStatus } from "@/hooks/useOnboarding";
import { trackEvent } from "@/lib/analytics";
import { Zap, AlertCircle } from "lucide-react";

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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              OmniTrackIQ
            </span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start your free trial today</p>
          </div>


          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="accountName" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Account name
              </label>
              <input
                id="accountName"
                className={`w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${fieldErrors.accountName
                  ? "border-danger-500 bg-danger-50 focus:border-danger-500 focus:ring-danger-500/20 dark:border-danger-400 dark:bg-danger-900/20"
                  : "border-slate-200 bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  }`}
                placeholder="Your company or team name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
              {fieldErrors.accountName && (
                <p className="flex items-center gap-1 text-xs text-danger-600 dark:text-danger-400">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.accountName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="email"
                className={`w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${fieldErrors.email
                  ? "border-danger-500 bg-danger-50 focus:border-danger-500 focus:ring-danger-500/20 dark:border-danger-400 dark:bg-danger-900/20"
                  : "border-slate-200 bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  }`}
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && (
                <p className="flex items-center gap-1 text-xs text-danger-600 dark:text-danger-400">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                id="password"
                className={`w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${fieldErrors.password
                  ? "border-danger-500 bg-danger-50 focus:border-danger-500 focus:ring-danger-500/20 dark:border-danger-400 dark:bg-danger-900/20"
                  : "border-slate-200 bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  }`}
                placeholder="At least 8 characters"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fieldErrors.password && (
                <p className="flex items-center gap-1 text-xs text-danger-600 dark:text-danger-400">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>
          </div>

          {fieldErrors.form && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 dark:border-danger-800 dark:bg-danger-900/20">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger-600 dark:text-danger-400" />
              <p className="text-sm text-danger-700 dark:text-danger-300">{fieldErrors.form}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-primary-600 hover:to-primary-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Privacy Policy
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

