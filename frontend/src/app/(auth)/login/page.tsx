"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SocialLoginButtons } from "@/components/auth";
import { getOnboardingStatus } from "@/hooks/useOnboarding";
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 dark:from-slate-900 dark:to-slate-800">
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your account</p>
          </div>

          {/* Social Login Buttons */}
          <SocialLoginButtons mode="login" />

          <div className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                className={`w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${fieldErrors.password
                    ? "border-danger-500 bg-danger-50 focus:border-danger-500 focus:ring-danger-500/20 dark:border-danger-400 dark:bg-danger-900/20"
                    : "border-slate-200 bg-white focus:border-primary-500 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  }`}
                placeholder="Enter your password"
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
            {isBusy ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

