"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Login failed");
      }
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      if (err?.name === "TypeError") {
        setError("Cannot reach API. Check server and NEXT_PUBLIC_API_URL.");
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 space-y-4">
        <h1 className="text-2xl font-semibold">Log in</h1>
        <input
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-sm text-rose-400">{error}</div>}
        <button
          disabled={loading}
          className="w-full rounded-md bg-emerald-500 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
        >
          {loading ? "Signing in..." : "Continue"}
        </button>
      </form>
    </main>
  );
}
