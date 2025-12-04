"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, error, reload } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-5 text-center shadow-xl">
          <div className="text-lg font-semibold text-white">Authentication error</div>
          <div className="mt-2 text-sm text-slate-400">{error}</div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <a
              href="/login"
              className="inline-flex rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
            >
              Go to login
            </a>
            <button
              onClick={() => reload()}
              className="inline-flex rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <div className="flex bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
