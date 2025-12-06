"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading, error: authError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const isBusy = useMemo(() => authLoading || submitting, [authLoading, submitting]);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (authError) {
      setFieldErrors({ form: authError });
    }
  }, [authError]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setFieldErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <div className="space-y-2">
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldErrors.email && <div className="text-sm text-rose-400">{fieldErrors.email}</div>}
        </div>
        <div className="space-y-2">
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {fieldErrors.password && <div className="text-sm text-rose-400">{fieldErrors.password}</div>}
        </div>
        {fieldErrors.form && <div className="text-sm text-rose-400">{fieldErrors.form}</div>}
        <button
          disabled={isBusy}
          className="w-full rounded-md bg-emerald-500 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
        >
          {isBusy ? "Signing in..." : "Continue"}
        </button>
      </form>
    </main>
  );
}
