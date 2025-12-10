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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500">Start your free trial today</p>
        </div>

        {/* Social Login Buttons */}
        <SocialLoginButtons mode="signup" />
        
        <div className="space-y-1">
          <label htmlFor="accountName" className="text-sm font-medium text-gray-700">Account name</label>
          <input
            id="accountName"
            className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              fieldErrors.accountName ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
            }`}
            placeholder="Your company or team name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
          {fieldErrors.accountName && <p className="text-sm text-red-600">{fieldErrors.accountName}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              fieldErrors.email ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
            }`}
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
        </div>
        
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            className={`w-full rounded-lg border px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              fieldErrors.password ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
            }`}
            placeholder="At least 8 characters"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password}</p>}
        </div>
        
        {fieldErrors.form && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {fieldErrors.form}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isBusy}
          className="w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? "Creating account..." : "Create account"}
        </button>
        
        <p className="text-center text-sm text-gray-500">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
            Privacy Policy
          </Link>
        </p>
        
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
