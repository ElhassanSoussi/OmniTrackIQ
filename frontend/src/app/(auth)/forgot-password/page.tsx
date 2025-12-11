"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setIsSubmitted(true);
    } catch (err) {
      // Even on error, show success for security (don't reveal if email exists)
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117] px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
              Check your email
            </h1>
          </div>

          <div className="rounded-md border border-[#d0d7de] bg-white p-6 shadow-sm dark:border-[#30363d] dark:bg-[#161b22]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#dafbe1] dark:bg-[#238636]/20">
                <svg className="h-6 w-6 text-[#238636]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-[#57606a] dark:text-[#8b949e]">
                If an account exists for <strong className="text-[#1f2328] dark:text-[#e6edf3]">{email}</strong>, 
                we&apos;ve sent a password reset link to your inbox.
              </p>
              <p className="mt-4 text-sm text-[#57606a] dark:text-[#8b949e]">
                Didn&apos;t receive an email? Check your spam folder or{" "}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-[#0969da] hover:underline dark:text-[#58a6ff]"
                >
                  try again
                </button>
              </p>
            </div>
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f8fa] dark:bg-[#0d1117] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#1f2328] dark:text-[#e6edf3]">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-[#57606a] dark:text-[#8b949e]">
            Enter your email address and we&apos;ll send you a link to reset your password.
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
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
                className="w-full rounded-md border border-[#d0d7de] bg-white px-3 py-2 text-sm placeholder-[#6e7781] focus:border-[#0969da] focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] dark:placeholder-[#6e7781]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full rounded-md bg-[#238636] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-[#238636] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-[#161b22]"
            >
              {isLoading ? "Sending..." : "Send reset link"}
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
