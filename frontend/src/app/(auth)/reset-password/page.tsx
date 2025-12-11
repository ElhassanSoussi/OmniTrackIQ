"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, new_password: password }),
      });
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117] px-4">
        <div className="w-full max-w-md">
          <div className="rounded-md border border-[#d0d7de] bg-white p-6 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ffebe9] dark:bg-[#490202]">
                <svg className="h-6 w-6 text-[#cf222e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                Invalid Reset Link
              </h2>
              <p className="mt-2 text-sm text-[#57606a] dark:text-[#8b949e]">
                This password reset link is invalid or has expired.
              </p>
              <Link
                href="/forgot-password"
                className="mt-4 inline-block text-sm text-[#0969da] hover:underline dark:text-[#58a6ff]"
              >
                Request a new reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117] px-4">
        <div className="w-full max-w-md">
          <div className="rounded-md border border-[#d0d7de] bg-white p-6 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#dafbe1] dark:bg-[#238636]/20">
                <svg className="h-6 w-6 text-[#238636]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">
                Password Reset Successful
              </h2>
              <p className="mt-2 text-sm text-[#57606a] dark:text-[#8b949e]">
                Your password has been reset. Redirecting you to login...
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm text-[#0969da] hover:underline dark:text-[#58a6ff]"
              >
                Go to login now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
            Create new password
          </h1>
          <p className="mt-2 text-sm text-[#57606a] dark:text-[#8b949e]">
            Enter your new password below.
          </p>
        </div>

        <div className="rounded-md border border-[#d0d7de] bg-white p-6 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-[#ffebe9] px-4 py-3 text-sm text-[#cf222e] dark:bg-[#490202] dark:text-[#f85149]">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full rounded-md border border-[#d0d7de] bg-white px-3 py-2 text-sm placeholder-[#6e7781] focus:border-[#0969da] focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] dark:placeholder-[#6e7781]"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Re-enter your password"
                className="w-full rounded-md border border-[#d0d7de] bg-white px-3 py-2 text-sm placeholder-[#6e7781] focus:border-[#0969da] focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] dark:placeholder-[#6e7781]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full rounded-md bg-[#238636] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-[#238636] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-[#161b22]"
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-[#57606a] dark:text-[#8b949e]">
          Remember your password?{" "}
          <Link href="/login" className="text-[#0969da] hover:underline dark:text-[#58a6ff]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#238636] border-t-transparent" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
