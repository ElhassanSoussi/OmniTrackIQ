"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface InviteInfo {
  email: string;
  role: string;
  account_name: string;
  status: string;
  expires_at: string;
  is_valid: boolean;
}

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInviteInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/team/invites/info/${token}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Invalid invitation");
        }
        const data = await res.json();
        setInviteInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid invitation");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteInfo();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/team/invites/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name: name || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to accept invitation");
      }

      const data = await res.json();
      
      // Store token and redirect
      localStorage.setItem("access_token", data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !inviteInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Invalid Invitation</h1>
          <p className="mt-2 text-gray-600">{error || "This invitation link is invalid or has expired."}</p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-block rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!inviteInfo.is_valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Invitation Expired</h1>
          <p className="mt-2 text-gray-600">
            This invitation has already been used or has expired. Please contact your team admin for a new invitation.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-block rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Join {inviteInfo.account_name}</h1>
            <p className="mt-2 text-gray-600">
              You&apos;ve been invited to join as a <span className="font-medium capitalize">{inviteInfo.role}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                value={inviteInfo.email}
                disabled
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Your Name (optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Create Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {submitError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? "Creating Account..." : "Accept Invitation & Join"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
