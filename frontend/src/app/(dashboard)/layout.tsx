"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, error, refresh } = useAuth();

  if (!loading && !user && !error) {
    router.replace("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-6 text-center shadow-sm">
          <div className="text-lg font-semibold text-gray-900">Authentication error</div>
          <div className="mt-2 text-sm text-gray-500">{error}</div>
          <div className="mt-5 flex items-center justify-center gap-3">
            <a
              href="/login"
              className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Go to login
            </a>
            <button
              onClick={() => refresh()}
              className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
